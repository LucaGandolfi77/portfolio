const PAGES = [
  { url: "/", title: "Welcome to the World-Wide Web!", html: `<html><head><title>Welcome to the World-Wide Web!</title></head><body>
<h1>Welcome to the World-Wide Web!</h1>
<p>Welcome to <b>CELLO</b>, the world's first <i>graphical</i> Web browser for <b>Windows 3.x</b>. Created at the <a href="/about">Cornell Law Information Institute</a> by Thomas R. Bruce, 1993–1994.</p>
<p>CELLO lets you surf a small corner of the early Web. Click a link below, or type an address in the Location bar.</p>
<p><b>Things to explore:</b></p>
<ul>
<li><a href="/about">About Cello 1.01a</a> — who made this thing</li>
<li><a href="/news">What's New</a> — the few pages that changed</li>
<li><a href="/catalog">The Whole Web Catalog</a> — a Yahoo-like directory of the era</li>
<li><a href="/surfing">Surfing the Internet</a> — a beginner's guide</li>
<li><a href="/gopher">Gopher Menu</a> — a classic Gopher listing</li>
<li><a href="/ftp">FTP Directory</a> — a SunSite file listing</li>
<li><a href="/news:alt.startrek">USENET: alt.startrek</a> — the newsgroup you asked for</li>
<li><a href="/webring">The 1994 WebRing</a> — circles of pages</li>
<li><a href="/guestbook">Guestbook</a> — sign the book</li>
<li><a href="/under">Under Construction</a> — it's under construction</li>
<li><a href="/images">Image Test Page</a> — images are not supported (and that is the whole point)</li>
<li><a href="/modern">google.com</a> — a very modern domain</li>
</ul>
<p><i>Best viewed at 640×480, 256 colors, with a 28.8 kbps modem.</i></p>
<p><b>Note:</b> Cello 1.01a does not display inline images. This is a feature, not a bug. Citation: history.</p>
</body></html>` },
  { url: "/about", title: "About Cello 1.01a", html: `<html><head><title>About Cello 1.01a</title></head><body>
<h1>About Cello 1.01a</h1>
<p><b>Cello</b> was developed at the <b>Cornell Law Information Institute</b> by <b>Thomas R. Bruce</b>. It was released in 1993 as one of the first graphical Web browsers for <b>Microsoft Windows 3.1</b>.</p>
<p>Version: <b>1.01a</b><br>
Platform: <b>Windows 3.x</b><br>
Copyright: <b>1993–1994</b> Cornell Law School<br>
License: Educational use</p>
<p>Cello supported HTML 2.0, forms, tables (partially), anchors, image maps (client-side), and the following protocols: <b>HTTP, FTP, Gopher, NNTP, Telnet, WAIS</b>.</p>
<p><b>Notable limitations:</b> Cello did <i>not</i> support inline images (that would come later with Mosaic). This is historically documented and mildly tragic.</p>
<p>Back to <a href="/">home</a>.</p>
</body></html>` },
  { url: "/news", title: "What's New", html: `<html><head><title>What's New</title></head><body>
<h1>What's New</h1>
<ul>
<li><b>12 June 1994</b> — Cello updated to 1.01a. Bug fixes and the usual.</li>
<li><b>5 June 1994</b> — New pages added: Guestbook and WebRing.</li>
<li><b>1 May 1994</b> — Gopher and FTP listings live.</li>
<li><b>15 April 1994</b> — Welcome to the World-Wide Web!</li>
</ul>
<p>Come back later. The Web is small today but growing fast.</p>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/catalog", title: "The Whole Web Catalog", html: `<html><head><title>The Whole Web Catalog</title></head><body>
<h1>The Whole Web Catalog</h1>
<p><i>Modeled after the great Yahoo directory — <b>Jerry and David's Guide to the World Wide Web</b>.</i></p>
<h2>Computers</h2>
<ul>
<li><a href="/gopher">Gopher</a> — the protocol of the month</li>
<li><a href="/ftp">FTP</a> — file transfer</li>
<li><a href="/news:alt.startrek">USENET</a> — discussion groups</li>
</ul>
<h2>Reference</h2>
<ul>
<li><a href="/surfing">Surfing the Internet</a> — a beginner's guide</li>
<li><a href="/about">About Cello</a> — the browser itself</li>
</ul>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/surfing", title: "Surfing the Internet", html: `<html><head><title>Surfing the Internet</title></head><body>
<h1>Surfing the Internet</h1>
<p><i>Adapted from the <b>University of Kansas</b> guide by Peter Flynn.</i></p>
<h2>What is the World-Wide Web?</h2>
<p>The Web is a collection of <b>hypertext</b> documents linked together. You can navigate by clicking <a href="/webring">links</a>.</p>
<h2>How to surf</h2>
<ol>
<li>Type an address in the <b>Location</b> bar.</li>
<li>Click a <a href="/catalog">link</a>.</li>
<li>Use <b>Back</b> and <b>Forward</b> to revisit pages.</li>
<li>Add favorites with the <b>☆</b> button.</li>
</ol>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/gopher", title: "Gopher Menu", html: `<html><head><title>Gopher Menu</title></head><body>
<h1>Gopher Menu</h1>
<p><b>Selectors</b> (type a number):</p>
<pre>
1.   Select this option
2.   Get help on selecting
3.   List currently available menus
4.   Quit Gopher
5.   Search
6.   About Gopher
</pre>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/ftp", title: "FTP Directory Listing", html: `<html><head><title>FTP Directory Listing</title></head><body>
<h1>FTP Directory Listing</h1>
<p>Directory: <b>/pub/misc/</b> on sunsite.unc.edu</p>
<pre>
bin/            (05-Aug-1993  12:00)
docs/           (02-Jan-1994  09:15)
fonts/          (15-Mar-1993  17:30)
README          (01-Jan-1994  00:01)
</pre>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/news:alt.startrek", title: "USENET: alt.startrek", html: `<html><head><title>USENET: alt.startrek</title></head><body>
<h1>USENET: alt.startrek</h1>
<p>Messages sorted by date (newest first):</p>
<pre>
From: trekkie@utopia.com
Subject: Re: Who shot first?
Date: 10 Jun 1994 12:00:00 GMT

Obviously Kirk. Fight me.</pre>
<pre>
From: spock@logic.org
Subject: The logical answer
Date: 09 Jun 1994 08:30:00 GMT

It was never a contest.</pre>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/webring", title: "The 1994 WebRing", html: `<html><head><title>The 1994 WebRing</title></head><body>
<h1>The 1994 WebRing</h1>
<p><i>Join the WebRing! A way to browse related sites in a circle.</i></p>
<pre>
  &lt;&lt; Prev    [This Site]    Next &gt;&gt;
  ──────────────────────────────
  You have joined the 1994 WebRing.
  Sites in this ring: 42
</pre>
<p><a href="/">Home</a> · <a href="/guestbook">Guestbook</a></p>
</body></html>` },
  { url: "/guestbook", title: "Guestbook", html: `<html><head><title>Guestbook</title></head><body>
<h1>Guestbook</h1>
<p><i>Sign the guestbook!</i></p>
<pre>
1234 visitors so far.

[1994-06-10] ~Trekkie~   "Live long and surf."
[1994-06-09] ~Spock~     "It's logical."
[1994-06-08] ~Kirk~      "Engage."
[1994-06-07] ~Scotty~    "I canna change the laws of physics, Captain."
</pre>
<p>Visit counter: <b>1,234</b> visitors.</p>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/under", title: "Under Construction", html: `<html><head><title>Under Construction</title></head><body>
<h1>Under Construction</h1>
<p><blink>⚠ THIS PAGE IS UNDER CONSTRUCTION ⚠</blink></p>
<p>We are currently building this page. Please come back later. Or don't. We are not watching.</p>
<p><i>Best viewed at 640×480.</i></p>
<pre>
  #####     ##     #     ##     ####  #    #
 #     #   #  #    #    #  #   #       #    #
 #        #    #   #   #    #   #  ## #    #
 #  ####  ######  #   ######   #  # # #    #
 #     #  #    #  #   #    #   #  ##   #
 #     #  #    #  #   #    #   #  #    #
  #####   #    #  #   #    #   ####  #    #
</pre>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/images", title: "Image Test Page", html: `<html><head><title>Image Test Page</title></head><body>
<h1>Image Test Page</h1>
<p>This page tests the image-handling capabilities of CELLO.</p>
<p><img src="pic1.gif" alt="A beautiful sunset"></p>
<p><img src="logo.bmp" alt="Logo"></p>
<p><img src="photo.jpg" alt="A portrait"></p>
<p><i>CELLO 1.01a does not display images. (And that is the whole point. Citation: history.)</i></p>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/modern", title: "google.com", html: `<html><head><title>google.com</title></head><body>
<h1>Domain Not Found</h1>
<p>You tried to visit <b>google.com</b>.</p>
<p><b>Error:</b> This domain will not be born until 1998. Please return later. In the meantime, try <a href="/catalog">The Whole Web Catalog</a>.</p>
<p><i>(If you enabled Modem Live, the page may load anyway via a modern reader — your mileage may vary.)</i></p>
<p><a href="/">Home</a></p>
</body></html>` },
  { url: "/404", title: "404 — Document Not Found", html: `<html><head><title>404 — Document Not Found</title></head><body>
<h1>404 — Document Not Found</h1>
<p>The document you requested could not be found on this server.</p>
<p>It may have been moved, deleted, or never existed. The Web was small in 1994; most things were here.</p>
<p><a href="/">Home</a></p>
</body></html>` }
];