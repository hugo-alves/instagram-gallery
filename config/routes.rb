Instagram::Application.routes.draw do  
  match '/feeds/popular' => 'feeds#popular', :as => :feeds_popular
  match '/feeds/user' => 'feeds#user', :as => :feeds_user
  
  match '/oauth/new' => 'oauth#new', :as => :new_oauth
  match '/oauth/callback' => 'oauth#callback', :as => :oauth_callback
  
  root :to => 'gallery#show'
end
