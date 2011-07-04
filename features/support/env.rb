require 'webmock/cucumber'
require 'vcr'
require 'cucumber/rails'
require 'mocha'
 
VCR.config do |c|
  c.stub_with :webmock
  c.cassette_library_dir = 'spec/fixtures/vcr'
  c.ignore_localhost = true
  c.default_cassette_options = { :record => :none, :re_record_interval => 7.days }
end

Capybara.default_selector = :css
ActionController::Base.allow_rescue = false

