require File.expand_path('../boot', __FILE__)

require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'active_resource/railtie'
require 'rails/test_unit/railtie'

Bundler.require(:default, Rails.env) if defined?(Bundler)

module Instagram
  class Application < Rails::Application
    config.action_view.javascript_expansions[:jquery] = %w(jquery.min.js jquery-ui.min.js)
    config.action_view.javascript_expansions[:backbone] = %w(underscore.min.js backbone.min.js)
    config.action_view.javascript_expansions[:defaults] = %w(application.js)
    
    config.encoding = "utf-8"
    config.filter_parameters += [:password]
  end
end

require 'settings'
