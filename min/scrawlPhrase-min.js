/*! scrawl-canvas 2015-12-02 */
if(window.scrawl&&window.scrawl.work.extensions&&!window.scrawl.contains(window.scrawl.work.extensions,"phrase"))var scrawl=function(a){"use strict";return a.newPhrase=function(b){return a.makePhrase(b)},a.makePhrase=function(b){return new a.Phrase(b)},a.pushUnique(a.work.sectionlist,"text"),a.pushUnique(a.work.nameslist,"textnames"),a.Phrase=function(b){return b=a.safeObject(b),a.Entity.call(this,b),a.Position.prototype.set.call(this,b),this.registerInLibrary(),this.texts=[],this.lineHeight=a.xtGet(b.lineHeight,a.work.d.Phrase.lineHeight),b.font?this.checkFont(b.font):this.constructFont(),this.size=this.get("size"),this.multiline(),this.getMetrics(),this},a.Phrase.prototype=Object.create(a.Entity.prototype),a.Phrase.prototype.type="Phrase",a.Phrase.prototype.classname="entitynames",a.work.d.Phrase={text:"",style:"normal",variant:"normal",weight:"normal",size:12,metrics:"pt",family:"sans-serif",lineHeight:1.5,backgroundColor:"",backgroundMargin:0,textAlongPath:"phrase",fixedWidth:!1,texts:[]},a.mergeInto(a.work.d.Phrase,a.work.d.Entity),a.Phrase.prototype.set=function(b){var c=a.xt;return a.Entity.prototype.set.call(this,b),b=a.safeObject(b),a.xto(b.text,b.size,b.scale,b.font,b.style,b.variant,b.metrics,b.family,b.lineHeight)&&(this.currentHandle.flag=!1,c(b.lineHeight)&&(this.lineHeight=b.lineHeight),b.font?this.checkFont(b.font):this.constructFont(),c(b.text)&&this.multiline(b.text)),this.getMetrics(),this},a.Phrase.prototype.setDelta=function(b){var c=a.xt;return a.Entity.prototype.setDelta.call(this,b),b=a.safeObject(b),a.xto(b.text,b.size,b.scale,b.font,b.style,b.variant,b.metrics,b.family,b.lineHeight)&&(this.currentHandle.flag=!1,c(b.lineHeight)&&(this.lineHeight+=b.lineHeight),b.font?this.checkFont(b.font):this.constructFont(),c(b.text)&&this.multiline(b.text)),this.getMetrics(),this},a.Phrase.prototype.clone=function(b){return b.texts=[],a.Entity.prototype.clone.call(this,b)},a.Phrase.prototype.multiline=function(b){var c,d,e,f,g,h,i=a.textnames,j=this.texts,k={},l=a.removeItem,m=a.Text;if(c=""+a.xtGet(b,this.text),d=c.split("\n"),a.xt(j))for(e=0,f=j.length;f>e;e++)delete a.text[j[e]],l(i,j[e]);for(j.length=0,k.phrase=this.name,g=0,h=d.length;h>g;g++)k.text=d[g],k.text.length>0&&new m(k);return this.text=c,this},a.Phrase.prototype.checkFont=function(b){return a.xt(b)&&this.deconstructFont(),this},a.Phrase.prototype.deconstructFont=function(){var b,c,d,e,f,g,h,i,j,k,l,m=[],n=[100,200,300,400,500,600,700,800,900,"italic","oblique","small-caps","bold","bolder","lighter","xx-small","x-small","small","medium","large","x-large","xx-large"],o=a.work.d.Phrase,p=a.xtGet;for(d=a.ctx[this.context].font,g=p(this.style,o.style),h=p(this.variant,o.variant),i=p(this.weight,o.weight),j=p(this.size,o.size),k=p(this.metrics,o.metrics),l=p(this.family,o.family),g=/italic/i.test(d)?"italic":/oblique/i.test(d)?"oblique":"normal",h=/small-caps/i.test(d)?"small-caps":"normal",/bold/i.test(d)?i="bold":/bolder/i.test(d)?i="bolder":/lighter/i.test(d)?i="lighter":/([1-9]00)/i.test(d)?(m=d.match(/([1-9]00)/i),i=m[1]):i="normal",m.length=0,/(\d+)(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)?/i.test(d)?(m=d.match(/(\d+)(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)/i),j=parseFloat(m[1]),k=m[2]):/xx-small/i.test(d)?(j=3,k="pt"):/x-small/i.test(d)?(j=6,k="pt"):/small/i.test(d)?(j=9,k="pt"):/medium/i.test(d)?(j=12,k="pt"):/large/i.test(d)?(j=15,k="pt"):/x-large/i.test(d)?(j=18,k="pt"):/xx-large/i.test(d)?(j=21,k="pt"):(j=12,k="pt"),e="",f=d.split(" "),b=0,c=f.length;c>b;b++)a.contains(n,f[b])||f[b].match(/[^\/](\d)+(%|in|cm|mm|em|rem|ex|pt|pc|px|vw|vh|vmin|vmax)?/i)||(e+=f[b]+" ");return e||(e=this.family),this.family=e,this.style=g,this.variant=h,this.weight=i,this.size=j,this.metrics=k,this.constructFont(),this},a.Phrase.prototype.constructFont=function(){var b,c,d,e,f,g,h,i=a.xtGet,j=a.work.d.Phrase;return b="",c=i(this.style,j.style),d=i(this.variant,j.variant),e=i(this.weight,j.weight),f=i(this.size,j.size),g=i(this.metrics,j.metrics),h=i(this.family,j.family),"normal"!==c&&(b+=c+" "),"normal"!==d&&(b+=d+" "),"normal"!==e&&(b+=e+" "),b+=f*this.scale+g+" ",b+=h,a.ctx[this.context].font=b,this},a.Phrase.prototype.stamp=function(b,c,d,e){var f;return this.visibility&&(f=a.entity[this.path]&&"Path"===a.entity[this.path].type,this.pivot||!f||"phrase"===this.get("textAlongPath")?a.Entity.prototype.stamp.call(this,b,c,d,e):(a.text[this.texts[0]].stampAlongPath(this,b,c,d),this.stampFilter(a.context[c],c,d))),this},a.Phrase.prototype.clear=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),b.globalCompositeOperation="destination-out",this.rotateCell(b,d),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].clear(b,c,d,g,h);return b.globalCompositeOperation=a.ctx[c].get("globalCompositeOperation"),this},a.Phrase.prototype.clearWithBackground=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),this.rotateCell(b,d),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].clearWithBackground(b,c,d,g,h);return this},a.Phrase.prototype.draw=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),this.rotateCell(b,d),a.xt(this.backgroundColor)&&this.addBackgroundColor(b,j),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].draw(b,c,d,g,h);return this},a.Phrase.prototype.fill=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),this.rotateCell(b,d),a.xt(this.backgroundColor)&&this.addBackgroundColor(b,j),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].fill(b,c,d,g,h);return this},a.Phrase.prototype.drawFill=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),this.rotateCell(b,d),a.xt(this.backgroundColor)&&this.addBackgroundColor(b,j),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].drawFill(b,c,d,g,h,this);return this},a.Phrase.prototype.fillDraw=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),this.rotateCell(b,d),a.xt(this.backgroundColor)&&this.addBackgroundColor(b,j),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].fillDraw(b,c,d,g,h,this);return this},a.Phrase.prototype.sinkInto=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),this.rotateCell(b,d),a.xt(this.backgroundColor)&&this.addBackgroundColor(b,j),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].sinkInto(b,c,d,g,h);return this},a.Phrase.prototype.floatOver=function(b,c,d){var e,f,g,h,i=this.getOffset(),j=this.currentHandle,k=this.size*this.lineHeight*this.scale,l=a.text,m=this.texts;for(d.setEngine(this),this.rotateCell(b,d),a.xt(this.backgroundColor)&&addBackgroundColor(b,j),g=j.x+i.x,e=0,f=m.length;f>e;e++)h=j.y+k*e+i.y,l[m[e]].floatOver(b,c,d,g,h);return this},a.Phrase.prototype.none=function(){return this},a.Phrase.prototype.getMetrics=function(){var b,c,d,e,f,g=a.text,h=this.texts;for(d=0,e=0,b=0,c=h.length;c>b;b++)f=g[h[b]],e=f.get("width")>e?f.width:e,d+=f.get("height");return this.width=e,this.height=d,this},a.Phrase.prototype.addBackgroundColor=function(b,c){var d,e,f,g,h;return f=this.get("backgroundMargin"),g=c.x-f,h=c.y-f,e=this.width*this.scale+2*f,d=this.height*this.scale+2*f,b.fillStyle=this.backgroundColor,b.fillRect(g,h,e,d),b.fillStyle=a.ctx[this.context].get("fillStyle"),this},a.Phrase.prototype.getOffset=function(){var b,c,d,e={x:0,y:0};switch(d=a.ctx[this.context],b=0,c=0,d.get("textAlign")){case"start":case"left":b=0;break;case"center":b=this.width/2*this.scale;break;case"right":case"end":b=this.width*this.scale}switch(d.get("textBaseline")){case"top":c=0;break;case"hanging":c=this.size*this.lineHeight*this.scale*.1;break;case"middle":c=this.size*this.lineHeight*this.scale*.5;break;case"bottom":c=this.size*this.lineHeight*this.scale;break;default:c=this.size*this.lineHeight*this.scale*.85}return e.x=b,e.y=c,e},a.Phrase.prototype.getMaxDimensions=function(a){return this.maxDimensions.top=0,this.maxDimensions.bottom=a.actualHeight,this.maxDimensions.left=0,this.maxDimensions.right=a.actualWidth,this.maxDimensions.flag=!1,this.maxDimensions},a.Text=function(b){var c,d=a.xtGet,e=(a.pushUnique,a.work.d.Text);return b=a.safeObject(b),a.Base.call(this,b),this.text=d(b.text,e.text),this.phrase=d(b.phrase,e.phrase),c=a.entity[this.phrase],this.context=c.context,this.fixedWidth=d(b.fixedWidth,e.fixedWidth),this.textAlongPath=d(b.textAlongPath,e.textAlongPath),this.glyphs=[],this.glyphWidths=[],a.text[this.name]=this,a.pushUnique(a.textnames,this.name),a.pushUnique(c.texts,this.name),this.getMetrics(),this},a.Text.prototype=Object.create(a.Base.prototype),a.Text.prototype.type="Text",a.Text.prototype.classname="textnames",a.work.d.Text={text:"",phrase:"",context:"",fixedWidth:!1,textAlongPath:"phrase",width:0,height:0,glyphs:[],glyphWidths:[]},a.mergeInto(a.work.d.Text,a.work.d.Base),a.Text.prototype.stampAlongPath=function(b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u=a.xt,v=a.entity,w=a.isBetween,x=a.work.radian;for(c=c.substring?c:b.method,f=a.context[d],h=a.entity[b.path].getPerimeterLength(),i=this.width*b.scale,j=i/h,k=b.pathPlace,m=this.text,0===this.glyphs.length&&this.getMetrics(),e.setEngine(b),s=this.glyphs,t=this.glyphWidths,q=0,r=s.length;r>q;q++)u(s[q])&&(this.text=s[q],l=k+t[q]/2/i*j,w(l,0,1,!0)||(l+=l>.5?-1:1),g=v[b.path].getPerimeterPosition(l,b.pathSpeedConstant,!0),n=g.x,o=g.y,p=g.r*x,f.setTransform(1,0,0,1,0,0),f.translate(n,o),f.rotate(p),f.translate(-n,-o),this[c](f,d,e,n,o,b),k+=t[q]/i*j,w(k,0,1,!0)||(k+=k>.5?-1:1));return this.text=m,this},a.Text.prototype.clipAlongPath=function(b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r=a.xt,s=a.entity,t=a.isBetween,u="floatOver",v=a.work.radian;for(c=a.work.cvx,e=a.entity[b.path].getPerimeterLength(),f=this.width*b.scale,g=f/e,h=b.pathPlace,j=this.text,0===this.glyphs.length&&this.getMetrics(),p=this.glyphs,q=this.glyphWidths,n=0,o=p.length;o>n;n++)r(p[n])&&(this.text=p[n],i=h+q[n]/2/f*g,t(i,0,1,!0)||(i+=i>.5?-1:1),d=s[b.path].getPerimeterPosition(i,b.pathSpeedConstant,!0),k=d.x,l=d.y,m=d.r*v,c.setTransform(1,0,0,1,0,0),c.translate(k,l),c.rotate(m),c.translate(-k,-l),this[u](c,null,null,k,l,b),h+=q[n]/f*g,t(h,0,1,!0)||(h+=h>.5?-1:1));return this.text=j,this},a.Text.prototype.clear=function(a,b,c,d,e){return a.fillText(this.text,d,e),this},a.Text.prototype.clearWithBackground=function(b,c,d,e,f){var g=a.ctx[c];return b.fillStyle=d.backgroundColor,b.globalAlpha=1,b.fillText(this.text,e,f),b.fillStyle=g.fillStyle,b.globalAlpha=g.globalAlpha,this},a.Text.prototype.draw=function(a,b,c,d,e){return a.strokeText(this.text,d,e),this},a.Text.prototype.fill=function(a,b,c,d,e){return a.fillText(this.text,d,e),this},a.Text.prototype.drawFill=function(a,b,c,d,e,f){return a.strokeText(this.text,d,e),f.clearShadow(a,c),a.fillText(this.text,d,e),f.restoreShadow(a,c),this},a.Text.prototype.fillDraw=function(a,b,c,d,e,f){return a.fillText(this.text,d,e),f.clearShadow(a,c),a.strokeText(this.text,d,e),f.restoreShadow(a,c),this},a.Text.prototype.sinkInto=function(a,b,c,d,e){return a.fillText(this.text,d,e),a.strokeText(this.text,d,e),this},a.Text.prototype.floatOver=function(a,b,c,d,e){return a.strokeText(this.text,d,e),a.fillText(this.text,d,e),this},a.Text.prototype.clip=function(){return this},a.Text.prototype.getMetrics=function(){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p;if(b=a.entity[this.phrase],c=a.work.cvx,d=a.ctx[this.context],e=c.font,f=c.textBaseline,g=c.textAlign,c.font=d.get("font"),c.textBaseline=d.get("textBaseline"),c.textAlign=d.get("textAlign"),this.width=c.measureText(this.text).width/b.scale,this.height=b.size*b.lineHeight,b.path)if(this.glyphs.length=0,this.glyphWidths.length=0,h=this.text,"word"===this.textAlongPath)for(j=this.text.split(" "),k=0,l=j.length;l>k;k++)this.glyphs.push(j[k]),this.glyphWidths.push(c.measureText(j[k]).width),a.xt(j[k+1])&&(this.glyphs.push(" "),this.glyphWidths.push(c.measureText(" ").width));else if(i=c.measureText(h).width,this.fixedWidth)for(m=0,n=h.length;n>m;m++)this.glyphs.push(h[m]),this.glyphWidths.push(i/n);else for(o=1,p=h.length;p>=o;o++)this.glyphs.push(h[o-1]),j=h.substr(0,o-1)+h.substr(o),this.glyphWidths.push(i-c.measureText(j).width);return c.font=e,c.textBaseline=f,c.textAlign=g,this},a}(scrawl);