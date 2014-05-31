# PNP: Personal Node Pages

Do you ever think "man, node.js is great, but I wish I could just throw up a simple website 
fast like I could in PHP?"

Well, screw you, I built this anyway! PNP serves a website that consists of nothing but EJS 
templates and static files, from any folder you choose.

**Update:** PNP is now [in production](http://silly.technology)!

## Installation

PNP is best used as a global utility:

`npm install pnp -g`

## Usage

Switch to the directory containing your templates, and just run:

`pnp`

You're done! Your site is now available at [http://localhost:5000](http://localhost:5000).

If you want to get fancy, you can specify the host (or IP) and port:

`pnp -p 8080 -h 192.168.0.101`

By default, PNP listens on all available IPs. This is convenient but insecure.

## Making a site

To create a new page in your site, simply create a file ending in `.ejs` and put it in the
directory where you are when you run PNP. You can create as many as you want, and it 
understands folders and sub-folders. Anything that doesn't end in `.ejs` (like CSS, or image
files) gets served straight up without any modification.

## Templates

PNP uses [EJS](https://www.npmjs.org/package/ejs) to do all templating. EJS is basically
JavaScript used the way PHP or ASP pages are: HTML, with code embedded in the HTML. Here's 
an example template:

    <%
    var fun = function() {
      return "woo"
    }
    %>
    <% title = 'Hello!' %>
    <% include templates/header %>
    
    <h1>Welcome!</h1>
    
    <p>This is the home page. Here's <a href="/foo">foo</a> and <a href="/foo/bar">bar</a></p>
    
    <p>Also <a href="/baz">baz</a> and <a href="woo">woo</a>.</p>
    
    <p>The time is <%= new Date() %>.</p>
    
    <p>Is this <%= fun() %>?</p>
    
    <% include templates/footer %>

You can define and use functions, include other templates, and run arbitrary JavaScript in
the template. You can also make use of variables in query strings. These are made available
in a variable called `_GET` (oh yeah, I'm bringing it back). So if your URL is 
[http://localhost/foo?x=y](http://localhost/foo?x=y) and you have a file called "foo.ejs"
in your site, you can put the following code in it:

    <p>The value of x is <%= _GET.x %></p>
    
And the page will print "The value of x is y". I will get around to POST variables at 
some point I'm sure.