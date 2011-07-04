class GalleryController < ApplicationController
  
  def popular
    @popular_photos = Instagram.media_popular
  end
  
end
