# ImgToShader

Hi!

I recently made this tool that allows you to change the background color, the logo color and the loading bar color of the Minecraft loading screen.
<b>Future updates are going to let you put images in the background, or make a color gradient on the background.</b>
 
 
## How does it works? 📄

Go on the [website](https://non0reo.github.io/ImgToShader/). You will see one big canvas, some options, the `Generate` button, and the generated code.<br>
Change the color of the elements, hide them, or even add your own background. When you are done, click on the `Generate` button and download the resource pack underneath.<br>
The script convert the color that you have chosen for the elements and transcribe them in core shader GLSL code (the language for shaders)

### Specifications:
* This tool is made to break as less things as possible in the game. If you encounter any issues, let me know by writing a [Ticket](https://github.com/Non0reo/ImgToShader/issues)
* The checkbox "Enable black screen compatibility" allows you to make your rendering compatible with the normal background in addition to the back background that you can toggle in the accessibility options.<br><b>   → Warning:</b> This option only break one known game element, the spyglass two black stripes. I may resolve this bug as soon as possible. Until then, if you find another element that this option breaks, you can also let me know by opening a [Ticket](https://github.com/Non0reo/ImgToShader/issues)

## Word From The Dev 👤


This tool was originaly made after seeing that we used to be able to change the mojang logo. As a fairly "new" Minecraft player (and map maker), I was a little bit disappointed when I saw that this trick was no longer possible. I had the idea for this project after seeing what optifine was even though alllowing to change the logo (and the background color)

I know that some people may say that this tool is disrespectful to Mojang. When making this tool, my main goal was not to remove mojang from its own game but more to give map makers and players a more flexible approach on what they're making.<br>
I think that Minecraft is a big game that is instantly recognizable. Also, a loading resource pack will only show the created background toward the end of the loading which let the player see the Mojang logo at the beginning.