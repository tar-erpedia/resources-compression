# Installation
`npm i @tar-erpedia/resources-compression -g`

# Usage
Write in your cli: `resources-compression`

# So... why? 🙄
When we are creating a website, we want it (obviously) to load as fast as possible
but there are limitations for that.
One of them - resources.

# Why resources are problematic ☠️ 
Images, gifs, and so on, weight... ALOT.
when a user loads the site, there's a need to load to resources for the user to see,
but getting big resources from the server can take time.
The smaller the resources - the faster they will load.

## So what should we do? 
**Compression!💪**  
Compression allows us to reduce the size on resources,
while (trying to)compromise minimun of the image's quality

# Ok so... how? 
There are known compression algorithms that do that,
the mvps right now now are: Avif, Webp.

*So how❓ use our package❗️*

# What does it do? 
we take your assets library, and convert (in a different destination) its content into your chosen
format.

*you can also choose your required quality!*

# What if my users browser wont support the format? 💩 
For instance, avif right now is supported from chrome version 85+,
but you know some users will meet the requirement and some wont.
there is a solution for it as well!
Did you ever hear about the **picture** html tag?

you can set your resource, using this tag, in a way that it'l get the resource in the format
that supports you website!.

for example:   
`<picture>`  
   &nbsp; &nbsp; `<source srcSet="/images/file.avif" type="image/avif" />`  
   &nbsp; &nbsp; `<img src="/file.webp /">`  
`</picture>`

here we try to use the avif format, and we give it fallback option to webp.

**Enjoy!🥳**

