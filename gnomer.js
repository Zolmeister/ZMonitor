#!/usr/bin/gjs

const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Webkit = imports.gi.WebKit;

const ZMonitor = new Lang.Class ({
    Name: 'ZMonitor',

    // Create the application itself
    _init: function () {
        this.application = new Gtk.Application ();

        // Connect 'activate' and 'startup' signals to the callback functions
        this.application.connect('activate', Lang.bind(this, this._onActivate));
        this.application.connect('startup', Lang.bind(this, this._onStartup));
    },

    // Callback function for 'activate' signal presents windows when active
    _onActivate: function () {
        this._window.present ();
    },

    // Callback function for 'startup' signal builds the UI
    _onStartup: function () {
        this._buildUI ();
    },

    // Build the application's UI
    _buildUI: function () {

        // Create the application window
        this._window = new Gtk.ApplicationWindow  ({
            application: this.application,
            title: "ZMonitor",
            default_height: 550,
            default_width: 720,
            window_position: Gtk.WindowPosition.CENTER });

        // Create a webview to show the web app
        this._webView = new Webkit.WebView ();

        // Put the web app into the webview
        this._webView.load_uri ("http://localhost:3003");

        // Put the webview into the window
        this._window.add (this._webView);

        // Show the window and all child widgets
        this._window.show_all();
    },

});

// Run the application
let app = new ZMonitor ();
app.application.run (ARGV);
