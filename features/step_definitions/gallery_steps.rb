Given /^the Instagram "([^"]*)" api returns (\d+) results$/ do |request_type, num|
  case request_type
  when "popular"
    num = (num.to_i-1)
    VCR.use_cassette("popular", :record => :new_episodes, :erb => true) do
      response = Instagram.media_popular
      Instagram.stubs(:media_popular).returns(response[0..num])
    end
  else
  end
end

Then /^I should see (\d+) media objects$/ do |num|
  page.should have_css('.photo', :count => num.to_i)
end