class OauthController < ApplicationController
  
  def new
    redirect_to Instagram.authorize_url(:redirect_uri => oauth_callback_url)
  end
  
  def callback
    begin
      response = Instagram.get_access_token(params[:code], :redirect_uri => oauth_callback_url)
      client = Instagram.client(:access_token => session[:access_token])
      session[:access_token] = response.access_token
      redirect_to root_url
    rescue :e => e
      raise e.to_yaml
      session[:access_token] = nil
      session[:username] = nil
      redirect_to root_url, :error => "Unable to authenticate you."
    end
  end
  
end
