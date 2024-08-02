Currently only included with 2 subtitle files. 

You are currently responsible for sourcing your subtitle files. You can either find them on an online database like captionfy.io 
or make them yourself through whatever means are convenient. 

Install#

Download the source folder

Install tampermonkey or another user script extension for you web browser

Install the Custom Subtitles userscript through your browser extension

Install Python

Place the Subs folder wherever is convenient and run the Python server. Now every file in that folder will be streamed to
a URL through that server. It is currently http://127.0.0.1:8000 in the source code, but if yours is different, then just
paste the correct URL into the user script wherever it comes up.

Place any and all subtitle files you wan't to use in the Subs folder.

Finally, where it says "cost subtitlePaths = {" Add the tag from the video url (the part of it that comes after 
'://www.youtube.com/watch' and the name of the corresponding subtitle folder in the format of the existing videos.

Now every time you visit that video, it will display your custom subtitles!

Best used with 10Ten/Yomitan and Anki for flashcard mining with screenshots//


////////////////////////

Known bugs :

 if you don't put just the identifier tag for the video in the wildcard section, some variations of the url can
end up not showing subtitles.

Changing from certain viewing modes (ie: theater to windowed) sometimes might not update the text position right
away. If this happens, just resize the browser window for a tiny bit and the text should return to its place.