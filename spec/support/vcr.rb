require 'vcr'

VCR.config do |c|
  c.stub_with :webmock
  c.cassette_library_dir = 'spec/fixtures/vcr'
  c.default_cassette_options = { :record => :none, :re_record_interval => 7.days }
end