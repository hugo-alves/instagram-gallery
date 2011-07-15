require File.expand_path('../boot', __FILE__)

require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'active_resource/railtie'
require 'rails/test_unit/railtie'

Bundler.require(:default, Rails.env) if defined?(Bundler)

module Instagram
  class Application < Rails::Application
    config.action_view.javascript_expansions[:jquery] = %w(vendor/jquery.min.js vendor/jquery-ui.min.js vendor/jquery.ui.map.min.js vendor/jquery.scrollTo-min.js)
    config.action_view.javascript_expansions[:backbone] = %w(vendor/underscore.min.js vendor/backbone.min.js)
    config.action_view.javascript_expansions[:app] = %w(app/models.js app/controllers.js app/views.js app/helpers.js)
    
    config.encoding = "utf-8"
    config.filter_parameters += [:password]
  end
end

require 'settings'
