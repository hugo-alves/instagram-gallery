class FeedsController < ApplicationController
  layout false
  
  def show
    session[:access_token] = nil
    if session[:access_token]
      client = Instagram.client(:access_token => session[:access_token])
      render :json => client.user_recent_media
    else
      get_popular
    end
  end
  
  protected
  
    def get_popular
      @photos = Rails.cache.read('popular')
      if @photos.nil?
        @photos = Rails.cache.write('popular', Instagram.media_popular, :expires_in => Settings.cache.expires)
        @photos = Rails.cache.read('popular')
      end
      render :json => @photos[0..29]
    end

end
