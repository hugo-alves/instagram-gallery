Instagram::Application.routes.draw do  
  match '/feed' => 'feeds#show', :as => :feed
  
  match '/oauth/new' => 'oauth#new', :as => :new_oauth
  match '/oauth/callback' => 'oauth#callback', :as => :oauth_callback
  
  root :to => 'gallery#show'
end
