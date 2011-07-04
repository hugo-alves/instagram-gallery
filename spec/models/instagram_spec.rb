require 'spec_helper'

describe Instagram do
  describe "A base instagram request" do
    use_vcr_cassette "popular", :record => :new_episodes
    
    let(:popular) { Instagram.media_popular }
    
    it "should have a basic results array" do
      popular.kind_of?(Array).should be(true)
    end
    
    describe "media objects" do
      let(:media_object) { popular.first }
      it "should have an id" do
        media_object.id.should_not be nil
      end
      it "should have a user" do
        media_object.id.should_not be nil
      end
      it "should have a caption that can be empty" do
        media_object.caption.present?.should_not be false
      end
      it "should have a link" do
        media_object.link.should_not be nil
      end
      it "should have a filter" do
        media_object.filter.should_not be nil
      end
      
      describe "#user" do
        it "should have a username" do
          media_object.user.username.should_not be nil
        end
        
        it "should have a full name" do
          media_object.user.full_name.should_not be nil
        end
        
        it "should have a profile picture" do
          media_object.user.profile_picture.should_not be nil
        end
      end
      
      describe "#images" do
        it "should have a thumbnail" do
          media_object.images.thumbnail.should_not be nil
        end
        it "should have a low resolution image" do
          media_object.images.low_resolution.should_not be nil
        end
        it "should have a 'standard' resolution image" do
          media_object.images.standard_resolution.should_not be nil
        end
      end
    end
  end
end