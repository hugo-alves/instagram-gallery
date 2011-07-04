require 'webmock/cucumber'
require 'cucumber/rails'

Capybara.default_selector = :css
ActionController::Base.allow_rescue = false

