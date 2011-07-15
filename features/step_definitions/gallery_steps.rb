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
  page.should have_css('.thumbnail', :count => num.to_i)
end

When /^I click on a thumbnail$/ do
  click_link("view expanded")
end

Then /^I should an expanded thumbnail$/ do
  page.should have_css('.expanded', :count => 1)
end