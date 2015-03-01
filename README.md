# Satori

TODO: Write a gem description

## Installation

Add this line to your application's Gemfile:

    gem 'satori'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install satori

## Usage

Add the following to your gemfile:

	gem 'satori'

Add the following directive to your Javascript manifest file (application.js):

	//= require satori

Add the following directive to your Css manifest file (applicaiton.css.scss):

	*= require satori

### SASS Variables

Satori's SASS variables can be overriden by setting the variable prior to importing Satori. The available variables are below:

	// 5 color scheme
	$background: #fff;
	$splash: #eaeaea;
	$foreground: rgba(0, 0, 0, .8);
	$primary: #42cafd;
	$secondary: #ff8500;

	// These are for comfort, but can/should be overidden.
	$border: #c8ccce;
	$text: $foreground;

	// Alert Colors
	$success: #41ad48;
	$error: #df5b57;
	$warning: yellow;
	$info: blue;

	// Responsive Design Breakpoints
	$break-small: 600px;
	$break-large: 960px;

	$base-size: 16px !default;
	$border-size: 1px;
	$default-spacing: 0.25rem;

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Development Notes

1. Remember to "rake release"
