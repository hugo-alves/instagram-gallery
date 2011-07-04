Instagram::Application.routes.draw do
  match '/popular' => 'gallery#popular', :as => :popular_gallery
  root :to => 'gallery#popular'
end
