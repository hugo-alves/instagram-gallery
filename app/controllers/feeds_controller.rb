class FeedsController < ApplicationController
  before_filter :get_popular
  layout false
  
  def popular
    @photos = Rails.cache.read('popular')
    if @photos.nil?
      @photos = Rails.cache.write('popular', Instagram.media_popular, :expires_in => Settings.cache.expires)
      @photos = Rails.cache.read('popular')
    end
    render :json => @photos[0..29]
  end
  
  def user
    if session[:access_token]
      client = Instagram.client(:access_token => session[:access_token])
      render :json => client.user_recent_media
    end
  end

  private
  
    def get_popular

    end
  
end
