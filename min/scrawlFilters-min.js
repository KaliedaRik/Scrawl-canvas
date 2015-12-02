/*! scrawl-canvas 2015-12-02 */
if(window.scrawl&&window.scrawl.work.extensions&&!window.scrawl.contains(window.scrawl.work.extensions,"filters"))var scrawl=function(a){"use strict";return a.pushUnique(a.work.sectionlist,"filter"),a.pushUnique(a.work.nameslist,"filternames"),a.work.filterCanvas=document.createElement("canvas"),a.work.filterCanvas.id="filterHiddenCanvasElement",a.work.f.appendChild(a.work.filterCanvas),a.work.filterCvx=a.work.filterCanvas.getContext("2d"),a.work.d.Pad.filters=[],a.work.d.Cell.filters=[],a.work.d.Entity.filters=[],a.work.d.Entity.filterOnStroke=!1,a.work.d.Entity.filterLevel="entity",a.xt(a.work.d.Block)&&a.mergeInto(a.work.d.Block,a.work.d.Entity),a.xt(a.work.d.Shape)&&a.mergeInto(a.work.d.Shape,a.work.d.Entity),a.xt(a.work.d.Wheel)&&a.mergeInto(a.work.d.Wheel,a.work.d.Entity),a.xt(a.work.d.Picture)&&a.mergeInto(a.work.d.Picture,a.work.d.Entity),a.xt(a.work.d.Phrase)&&a.mergeInto(a.work.d.Phrase,a.work.d.Entity),a.xt(a.work.d.Path)&&a.mergeInto(a.work.d.Path,a.work.d.Entity),a.Pad.prototype.filtersPadInit=function(){this.filters=[]},a.Cell.prototype.filtersCellInit=function(){this.filters=[]},a.Entity.prototype.filtersEntityInit=function(b){var c=a.xtGet;b=a.safeObject(b),this.filters=a.xt(b.filters)?b.filters:[],this.filterOnStroke=c(b.filterOnStroke,!1),this.filterLevel=c(b.filterLevel,"entity")},a.newGreyscaleFilter=function(b){return a.makeGreyscaleFilter(b)},a.newInvertFilter=function(b){return a.makeInvertFilter(b)},a.newBrightnessFilter=function(b){return a.makeBrightnessFilter(b)},a.newSaturationFilter=function(b){return a.makeSaturationFilter(b)},a.newThresholdFilter=function(b){return a.makeThresholdFilter(b)},a.newChannelsFilter=function(b){return a.makeChannelsFilter(b)},a.newChannelStepFilter=function(b){return a.makeChannelStepFilter(b)},a.newTintFilter=function(b){return a.makeTintFilter(b)},a.newSepiaFilter=function(b){return a.makeSepiaFilter(b)},a.newMatrixFilter=function(b){return a.makeMatrixFilter(b)},a.newSharpenFilter=function(b){return a.makeSharpenFilter(b)},a.newPixelateFilter=function(b){return a.makePixelateFilter(b)},a.newBlurFilter=function(b){return a.makeBlurFilter(b)},a.newLeachFilter=function(b){return a.makeLeachFilter(b)},a.newSeparateFilter=function(b){return a.makeSeparateFilter(b)},a.newNoiseFilter=function(b){return a.makeNoiseFilter(b)},a.makeGreyscaleFilter=function(b){return new a.GreyscaleFilter(b)},a.makeInvertFilter=function(b){return new a.InvertFilter(b)},a.makeBrightnessFilter=function(b){return new a.BrightnessFilter(b)},a.makeSaturationFilter=function(b){return new a.SaturationFilter(b)},a.makeThresholdFilter=function(b){return new a.ThresholdFilter(b)},a.makeChannelsFilter=function(b){return new a.ChannelsFilter(b)},a.makeChannelStepFilter=function(b){return new a.ChannelStepFilter(b)},a.makeTintFilter=function(b){return new a.TintFilter(b)},a.makeSepiaFilter=function(b){return b.redInRed=.393,b.redInGreen=.349,b.redInBlue=.272,b.greenInRed=.769,b.greenInGreen=.686,b.greenInBlue=.534,b.blueInRed=.189,b.blueInGreen=.168,b.blueInBlue=.131,new a.TintFilter(b)},a.makeMatrixFilter=function(b){return new a.MatrixFilter(b)},a.makeSharpenFilter=function(b){return b.data=[0,-1,0,-1,5,-1,0,-1,0],new a.MatrixFilter(b)},a.makePixelateFilter=function(b){return new a.PixelateFilter(b)},a.makeBlurFilter=function(b){return new a.BlurFilter(b)},a.makeLeachFilter=function(b){return new a.LeachFilter(b)},a.makeSeparateFilter=function(b){return new a.SeparateFilter(b)},a.makeNoiseFilter=function(b){return new a.NoiseFilter(b)},a.Pad.prototype.compile=function(b){var c,d,e,f=a.cell,g=this.cellsCompileOrder;for(this.filters.length=0,this.sortCellsCompile(),d=0,e=g.length;e>d;d++)c=f[g[d]],c.rendered&&c.compiled&&c.compile(b);return this},a.Pad.prototype.show=function(){var b,c,d,e,f,g=a.cell,h=this.cells,i=a.context,j=(a.xt,a.group,a.entity),k=this.filters;for(b=g[this.display],c=g[this.base],this.sortCellsShow(),e=0,f=h.length;f>e;e++)d=g[h[e]],d.rendered&&d.shown&&c.copyCellToSelf(d);for(e=0,f=k.length;f>e;e++)j[k[e]].stampFilter(i[c.name],c.name,c,!0);return b.copyCellToSelf(c,!0),this},a.Cell.prototype.compile=function(b){var c,d,e,f=a.group,g=this.groups,h=this.filters,i=(a.xt,a.context[this.name]),j=a.entity;for(h.length=0,this.groupSort(),d=0,e=g.length;e>d;d++)c=f[g[d]],c.visibility&&c.stamp(!1,this.name,this,b);for(d=0,e=h.length;e>d;d++)j[h[d]].stampFilter(i,this.name,this,!0);return!0},a.Entity.prototype.stampFilterActions={Phrase:function(a,b,c,d){return a.stampFilterPhrase(a,b,c,d)},Picture:function(a,b,c,d){return a.stampFilterPicture(a,b,c,d)},Wheel:function(a,b,c,d,e){return a.stampFilterWheel(a,b,c,d,e)},Block:function(a,b,c,d){return a.stampFilterDefault(a,b,c,d)},Shape:function(a,b,c,d){return a.stampFilterDefault(a,b,c,d)},Path:function(a,b,c,d){return a.stampFilterDefault(a,b,c,d)},Frame:function(a,b,c,d){return a.stampFilterDefault(a,b,c,d)}},a.Frame&&(a.Frame.prototype.stampFilterActions=a.Entity.prototype.stampFilterActions),a.Entity.prototype.stampFilter=function(b,c,d,e){var f,g,h,i,j,k,l,m,n,o=(a.group[this.group],"source-over"),p=a.work.cv,q=a.work.cvx,r=a.filter,s=this.filters,t=a.xt,u=this.filterLevel,v=this.filterOnStroke||!1,w=this.stampFilterActions;if(e=t(e)?e:!1,s.length>0){if(m=a.cell[a.group[this.group].cell],n=a.pad[m.pad],"pad"===u&&!e)return void n.filters.push(this.name);if("cell"===u&&!e)return void m.filters.push(this.name);if(h=a.canvas[c],p.width=h.width,p.height=h.height,q.save(),g=this.maxDimensions.flag?this.getMaxDimensions(d):this.maxDimensions,f=w[this.type](this,b,c,d,v)){for(j=0,k=s.length;k>j;j++)l=r[s[j]],l&&(f=l.add(f,g),o=t(l.operation)?r[s[j]].operation:o);q.putImageData(f,0,0),b.globalCompositeOperation!==o?(i=b.globalCompositeOperation,b.globalCompositeOperation=o,b.setTransform(1,0,0,1,0,0),b.drawImage(p,0,0,h.width,h.height),b.globalCompositeOperation=i):(b.setTransform(1,0,0,1,0,0),b.drawImage(p,0,0,h.width,h.height))}q.restore()}},a.Entity.prototype.stampFilterPhrase=function(b,c,d){var e,f,g,h,i,j=a.text,k=b.texts,l=a.entity,m=a.work.cvx,n=a.work.cv,o=a.work.cvwrapper;return e=a.canvas[d],h=e.width,i=e.height,f=a.ctx[b.context],n.width=h,n.height=i,m.font=f.font,m.fillStyle="rgb(0, 0, 0)",m.strokeStyle="rgb(0, 0, 0)",m.textAlign=f.textAlign,m.textBaseline=f.textBaseline,g=l[b.path]&&"Path"===l[b.path].type,b.pivot||!g||"phrase"===b.get("textAlongPath")?b.floatOver(m,o.name,o):j[k[0]].clipAlongPath(b),m.setTransform(1,0,0,1,0,0),m.globalCompositeOperation="source-in",m.drawImage(e,0,0),m.globalCompositeOperation="source-over",m.getImageData(0,0,h,i)},a.Entity.prototype.stampFilterWheel=function(b,c,d,e,f){var g=a.canvas[d],h=a.ctx[b.context],i=a.work.cvx,j=a.work.cvwrapper;return f?(i.lineWidth=h.lineWidth,i.lineJoin=h.lineJoin,i.lineCap=h.lineCap,i.miterLimit=h.miterLimit,i.lineDash=h.lineDash,i.lineDashOffset=h.lineDashOffset,i.globalAlpha=h.globalAlpha,i.strokeStyle="#000000",b.buildPath(i,j),i.stroke(),i.setTransform(1,0,0,1,0,0),i.globalCompositeOperation="source-in",i.drawImage(g,0,0),i.globalCompositeOperation="source-over"):(b.clip(i,j.name,j),i.setTransform(1,0,0,1,0,0),i.drawImage(g,0,0)),i.getImageData(0,0,g.width,g.height)},a.Entity.prototype.stampFilterPicture=function(b,c,d){var e,f,g,h=a.work.cvx,i=a.work.cv,j=b.copyData,k=b.pasteData;return e=a.canvas[d],f=b.getImage(),f?(g=b.currentHandle,b.rotateCell(h,i),h.drawImage(f,j.x,j.y,j.w,j.h,g.x,g.y,k.w,k.h),h.setTransform(1,0,0,1,0,0),h.globalCompositeOperation="source-in",h.drawImage(e,0,0),h.globalCompositeOperation="source-over",h.getImageData(0,0,e.width,e.height)):!1},a.Entity.prototype.stampFilterDefault=function(b,c,d,e){var f=a.canvas[d],g=a.work.cvx;return b.clip(g,d,e),g.setTransform(1,0,0,1,0,0),g.drawImage(f,0,0),g.getImageData(0,0,f.width,f.height)},a.Filter=function(b){var c=a.xtGet;return b=a.safeObject(b),a.Base.call(this,b),this.alpha=c(b.alpha,1),this.composite=c(b.composite,"source-over"),this},a.Filter.prototype=Object.create(a.Base.prototype),a.Filter.prototype.type="Filter",a.Filter.prototype.classname="filternames",a.work.d.Filter={alpha:1,composite:"source-over"},a.mergeInto(a.work.d.Filter,a.work.d.Base),a.Filter.prototype.add=function(a){return a},a.Filter.prototype.cloneImageData=function(b){var c,d,e=a.work.filterCanvas,f=a.work.filterCvx;return a.xt(b)&&a.xta(b.width,b.height)?(c=b.width,d=b.height,e.width=c,e.height=d,f.putImageData(b,0,0),f.getImageData(0,0,c,d)):!1},a.Filter.prototype.getAlpha=function(){var a=this.alpha.substring?parseFloat(this.alpha)/100:this.alpha;return a>=0&&1>=a?a:a>.5?1:0},a.GreyscaleFilter=function(b){return b=a.safeObject(b),a.Filter.call(this,b),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.GreyscaleFilter.prototype=Object.create(a.Filter.prototype),a.GreyscaleFilter.prototype.type="GreyscaleFilter",a.GreyscaleFilter.prototype.classname="filternames",a.work.d.GreyscaleFilter={},a.mergeInto(a.work.d.GreyscaleFilter,a.work.d.Filter),a.GreyscaleFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j=a.width,k=b.left,l=b.right,m=b.top,n=b.bottom;for(c=this.getAlpha(),d=a.data,i=m;n>i;i++)for(h=k;l>h;h++)g=4*(i*j+h),d[g+3]&&(e=g,f=Math.floor(.2126*d[e]+.7152*d[++e]+.0722*d[++e]),e=g,d[e]=f,d[++e]=f,d[++e]=f,d[++e]*=c);return a},a.InvertFilter=function(b){return b=a.safeObject(b),a.Filter.call(this,b),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.InvertFilter.prototype=Object.create(a.Filter.prototype),a.InvertFilter.prototype.type="InvertFilter",a.InvertFilter.prototype.classname="filternames",a.work.d.InvertFilter={},a.mergeInto(a.work.d.InvertFilter,a.work.d.Filter),a.InvertFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i=a.width,j=b.left,k=b.right,l=b.top,m=b.bottom;for(c=this.getAlpha(),d=a.data,h=l;m>h;h++)for(g=j;k>g;g++)f=4*(h*i+g),d[f+3]&&(e=f,d[e]=255-d[e],d[++e]=255-d[e],d[++e]=255-d[e],d[++e]*=c);return a},a.BrightnessFilter=function(b){return b=a.safeObject(b),a.Filter.call(this,b),this.brightness=a.xtGet(b.brightness,1),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.BrightnessFilter.prototype=Object.create(a.Filter.prototype),a.BrightnessFilter.prototype.type="BrightnessFilter",a.BrightnessFilter.prototype.classname="filternames",a.work.d.BrightnessFilter={brightness:1},a.mergeInto(a.work.d.BrightnessFilter,a.work.d.Filter),a.BrightnessFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j=a.width,k=b.left,l=b.right,m=b.top,n=b.bottom;for(c=this.getAlpha(),f=this.brightness.substring?parseFloat(this.brightness)/100:this.brightness,d=a.data,f=0>f?0:f,i=m;n>i;i++)for(h=k;l>h;h++)g=4*(i*j+h),d[g+3]&&(e=g,d[e]*=f,d[++e]*=f,d[++e]*=f,d[++e]*=c);return a},a.SaturationFilter=function(b){return b=a.safeObject(b),a.Filter.call(this,b),this.saturation=a.xtGet(b.saturation,1),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.SaturationFilter.prototype=Object.create(a.Filter.prototype),a.SaturationFilter.prototype.type="SaturationFilter",a.SaturationFilter.prototype.classname="filternames",a.work.d.SaturationFilter={saturation:1},a.mergeInto(a.work.d.SaturationFilter,a.work.d.Filter),a.SaturationFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j=a.width,k=b.left,l=b.right,m=b.top,n=b.bottom;for(c=this.getAlpha(),f=this.saturation.substring?parseFloat(this.saturation)/100:this.saturation,f=0>f?0:f,d=a.data,i=m;n>i;i++)for(h=k;l>h;h++)g=4*(i*j+h),d[g+3]&&(e=g,d[e]=127+(d[e]-127)*f,d[++e]=127+(d[e]-127)*f,d[++e]=127+(d[e]-127)*f,d[++e]*=c);return a},a.ThresholdFilter=function(b){return b=a.safeObject(b),a.Filter.call(this,b),this.threshold=a.xtGet(b.threshold,.5),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.ThresholdFilter.prototype=Object.create(a.Filter.prototype),a.ThresholdFilter.prototype.type="ThresholdFilter",a.ThresholdFilter.prototype.classname="filternames",a.work.d.ThresholdFilter={threshold:.5},a.mergeInto(a.work.d.ThresholdFilter,a.work.d.Filter),a.ThresholdFilter.prototype.add=function(b,c){var d,e,f,g,h,i,j,k,l=b.width,m=c.left,n=c.right,o=c.top,p=c.bottom;for(d=this.getAlpha(),g=this.threshold.substring?parseFloat(this.threshold)/100:this.threshold,g=a.isBetween(g,0,1,!0)?g:g>.5?1:0,g*=255,b=a.GreyscaleFilter.prototype.add.call(this,b,c),e=b.data,k=o;p>k;k++)for(j=m;n>j;j++)i=4*(k*l+j),e[i+3]&&(f=i,h=e[f]>g?255:0,e[f]=h,e[++f]=h,e[++f]=h,e[++f]*=d);return b},a.ChannelsFilter=function(b){var c=a.xtGet;return b=a.safeObject(b),a.Filter.call(this,b),this.red=c(b.red,1),this.green=c(b.green,1),this.blue=c(b.blue,1),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.ChannelsFilter.prototype=Object.create(a.Filter.prototype),a.ChannelsFilter.prototype.type="ChannelsFilter",a.ChannelsFilter.prototype.classname="filternames",a.work.d.ChannelsFilter={red:1,green:1,blue:1},a.mergeInto(a.work.d.ChannelsFilter,a.work.d.Filter),a.ChannelsFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j,k,l=a.width,m=b.left,n=b.right,o=b.top,p=b.bottom;for(c=this.getAlpha(),f=this.red.substring?parseFloat(this.red)/100:this.red,g=this.green.substring?parseFloat(this.green)/100:this.green,h=this.blue.substring?parseFloat(this.blue)/100:this.blue,d=a.data,f=0>f?0:f,g=0>g?0:g,h=0>h?0:h,k=o;p>k;k++)for(j=m;n>j;j++)i=4*(k*l+j),d[i+3]&&(e=i,d[e]*=f,d[++e]*=g,d[++e]*=h,d[++e]*=c);return a},a.ChannelStepFilter=function(b){var c=a.xtGet;return b=a.safeObject(b),a.Filter.call(this,b),this.red=c(b.red,1),this.green=c(b.green,1),this.blue=c(b.blue,1),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.ChannelStepFilter.prototype=Object.create(a.Filter.prototype),a.ChannelStepFilter.prototype.type="ChannelStepFilter",a.ChannelStepFilter.prototype.classname="filternames",a.work.d.ChannelStepFilter={red:1,green:1,blue:1},a.mergeInto(a.work.d.ChannelStepFilter,a.work.d.Filter),a.ChannelStepFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o=a.width,p=b.left,q=b.right,r=b.top,s=b.bottom,t=Math.floor;for(c=this.getAlpha(),f=this.red,g=this.green,h=this.blue,d=a.data,f=1>f?1:f,g=1>g?1:g,h=1>h?1:h,n=r;s>n;n++)for(m=p;q>m;m++)l=4*(n*o+m),d[l+3]&&(e=l,i=d[e],j=d[++e],k=d[++e],e=l,d[e]=t(i/f)*f,d[++e]=t(j/g)*g,d[++e]=t(k/h)*h,d[++e]*=c);return a},a.TintFilter=function(b){var c=a.xtGet;return b=a.safeObject(b),a.Filter.call(this,b),this.redInRed=c(b.redInRed,1),this.redInGreen=c(b.redInGreen,0),this.redInBlue=c(b.redInBlue,0),this.greenInRed=c(b.greenInRed,0),this.greenInGreen=c(b.greenInGreen,1),this.greenInBlue=c(b.greenInBlue,0),this.blueInRed=c(b.blueInRed,0),this.blueInGreen=c(b.blueInGreen,0),this.blueInBlue=c(b.blueInBlue,1),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.TintFilter.prototype=Object.create(a.Filter.prototype),a.TintFilter.prototype.type="TintFilter",a.TintFilter.prototype.classname="filternames",a.work.d.TintFilter={redInRed:1,greenInRed:0,blueInRed:0,redInGreen:0,greenInGreen:1,blueInGreen:0,redInBlue:0,greenInBlue:0,blueInBlue:1},a.mergeInto(a.work.d.TintFilter,a.work.d.Filter),a.TintFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u=a.width,v=b.left,w=b.right,x=b.top,y=b.bottom;for(c=this.getAlpha(),i=this.redInRed.substring?parseFloat(this.redInRed)/100:this.redInRed,j=this.redInGreen.substring?parseFloat(this.redInGreen)/100:this.redInGreen,k=this.redInBlue.substring?parseFloat(this.redInBlue)/100:this.redInBlue,l=this.greenInRed.substring?parseFloat(this.greenInRed)/100:this.greenInRed,m=this.greenInGreen.substring?parseFloat(this.greenInGreen)/100:this.greenInGreen,n=this.greenInBlue.substring?parseFloat(this.greenInBlue)/100:this.greenInBlue,o=this.blueInRed.substring?parseFloat(this.blueInRed)/100:this.blueInRed,p=this.blueInGreen.substring?parseFloat(this.blueInGreen)/100:this.blueInGreen,q=this.blueInBlue.substring?parseFloat(this.blueInBlue)/100:this.blueInBlue,d=a.data,t=x;y>t;t++)for(s=v;w>s;s++)r=4*(t*u+s),d[r+3]&&(e=r,f=d[e],g=d[++e],h=d[++e],e=r,d[e]=f*i+g*l+h*o,d[++e]=f*j+g*m+h*p,d[++e]=f*k+g*n+h*q,d[++e]*=c);return a},a.MatrixFilter=function(b){var c=a.xtGet,d=Math.floor;return b=a.safeObject(b),a.Filter.call(this,b),this.width=c(b.width,!1),this.height=c(b.height,!1),this.data=a.xt(b.data)?b.data:[1],this.x=c(b.x,d(this.width/2)),this.y=c(b.y,d(this.height/2)),this.includeInvisiblePoints=c(b.includeInvisiblePoints,!1),this.setFilter(),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.MatrixFilter.prototype=Object.create(a.Filter.prototype),a.MatrixFilter.prototype.type="MatrixFilter",a.MatrixFilter.prototype.classname="filternames",a.work.d.MatrixFilter={width:1,height:1,x:0,y:0,includeInvisiblePoints:!1,data:!1},a.mergeInto(a.work.d.MatrixFilter,a.work.d.Filter),a.MatrixFilter.prototype.set=function(b){var c=a.xtGet;a.Base.prototype.set.call(this,b),this.width=c(b.width,!1),this.height=c(b.height,!1),this.setFilter()},a.MatrixFilter.prototype.setFilter=function(){var b,c,d,e,f,g=0,h=Math.floor,i=Math.ceil,j=Math.round,k=Math.pow,l=Math.sqrt,m=this.data;for(!this.height&&this.width&&this.width.toFixed&&this.width>=1?(this.width=h(this.width),e=i(m.length/this.width),this.height=e,e=this.width*this.height):!this.width&&this.height&&this.height.toFixed&&this.height>=1?(this.height=h(this.height),e=i(m.length/this.height),this.width=e,e=this.width*this.height):this.width&&this.width.toFixed&&this.width>=1&&this.height&&this.height.toFixed&&this.height>=1?(this.width=j(this.width),this.height=j(this.height),e=this.width*this.height):(e=i(l(m.length)),e=e%2===1?k(e,2):k(e+1,2),this.width=j(l(e)),this.height=this.width),d=0;e>d;d++)m[d]=a.xt(m[d])?parseFloat(m[d]):0,m[d]=isNaN(m[d])?0:m[d];for(this.cells=[],f=this.cells,b=0;b<this.height;b++)for(c=0;c<this.width;c++)0!==m[g]&&f.push([c-this.x,b-this.y,m[g]]),g++;return this},a.MatrixFilter.prototype.add=function(b,c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w=b.width,x=b.height,y=c.left,z=c.right,A=c.top,B=c.bottom,C=this.cells;if(d=this.getAlpha(),e=b.data,g=a.work.cvx.createImageData(w,x),f=g.data,this.includeInvisiblePoints){for(k=A,l=B;l>k;k++)for(m=y,n=z;n>m;m++)if(t=4*(k*w+m),e[t+3]>0){for(h=0,i=0,j=0,r=0,o=0,p=C.length;p>o;o++)u=m+C[o][0],v=k+C[o][1],u>=0&&w>u&&v>=0&&x>v&&(q=C[o][2],s=4*(v*w+u),r+=q,h+=e[s]*q,s++,i+=e[s]*q,s++,j+=e[s]*q);0!==r&&(h/=r,i/=r,j/=r),f[t]=h,t++,f[t]=i,t++,f[t]=j,t++,f[t]=e[t]*d}}else for(k=A,l=B;l>k;k++)for(m=y,n=z;n>m;m++)if(t=4*(k*w+m),e[t+3]){for(h=0,i=0,j=0,r=0,o=0,p=C.length;p>o;o++)u=m+C[o][0],v=k+C[o][1],u>=0&&w>u&&v>=0&&x>v&&(q=C[o][2],s=4*(v*w+u),e[s+3]>0&&(r+=q,h+=e[s]*q,s++,i+=e[s]*q,s++,j+=e[s]*q));0!==r&&(h/=r,i/=r,j/=r),f[t]=h,t++,f[t]=i,t++,f[t]=j,t++,f[t]=e[t]*d}return g},a.PixelateFilter=function(b){var c=a.xtGet;return b=a.safeObject(b),a.Filter.call(this,b),this.width=c(b.width,5),this.height=c(b.height,5),this.offsetX=c(b.offsetX,0),this.offsetY=c(b.offsetY,0),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.PixelateFilter.prototype=Object.create(a.Filter.prototype),a.PixelateFilter.prototype.type="PixelateFilter",a.PixelateFilter.prototype.classname="filternames",a.work.d.PixelateFilter={width:5,height:5,offsetX:0,offsetY:0},a.mergeInto(a.work.d.PixelateFilter,a.work.d.Filter),a.PixelateFilter.prototype.add=function(b,c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A=Math.round,B=c.left,C=c.right,D=c.top,E=c.bottom;for(d=this.getAlpha(),e=b.data,g=a.work.cvx.createImageData(b.width,b.height),f=g.data,t=b.width,u=b.height,v=t-1,w=u-1,r=this.width,s=this.height,p=this.offsetX-r;t>p;p+=r)for(q=this.offsetY-s;u>q;q+=s){for(h=0,i=0,j=0,k=0,x=0,l=q,m=q+s;m>l;l++)for(n=p,o=p+r;o>n;n++)z=B>n||n>C||D>l||l>E?!0:!1,z||(y=4*(l*t+n),e[y+3]&&(h+=e[y],i+=e[++y],j+=e[++y],k+=e[++y],x++));if(x&&k)for(h=A(h/x),i=A(i/x),j=A(j/x),y=4*(q*t+p),l=q,m=q+s;m>l;l++)for(n=p,o=p+r;o>n;n++)y=4*(l*t+n),f[y]=h,f[++y]=i,f[++y]=j,f[++y]=e[y]*d}return g},a.BlurFilter=function(b){var c=a.xtGet;return b=a.safeObject(b),a.Filter.call(this,b),this.radiusX=c(b.radiusX,2),this.radiusY=c(b.radiusY,2),this.roll=c(b.roll,2),this.skip=c(b.skip,1),this.cells=a.xt(b.cells)?b.cells:!1,this.includeInvisiblePoints=c(b.includeInvisiblePoints,!1),Array.isArray(this.cells)||(this.cells=this.getBrush()),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.BlurFilter.prototype=Object.create(a.Filter.prototype),a.BlurFilter.prototype.type="BlurFilter",a.BlurFilter.prototype.classname="filternames",a.work.d.BlurFilter={radiusX:2,radiusY:2,skip:1,roll:0,includeInvisiblePoints:!1},a.mergeInto(a.work.d.BlurFilter,a.work.d.Filter),a.BlurFilter.prototype.set=function(b){a.Base.prototype.set.call(this,b),Array.isArray(b.cells)||(this.cells=this.getBrush())},a.BlurFilter.prototype.add=function(b,c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x=this.cells,y=b.width,z=b.height,A=c.left,B=c.right,C=c.top,D=c.bottom;if(d=this.getAlpha(),e=b.data,f=a.work.cvx.createImageData(y,z),g=f.data,h=x.length,i=Math.floor(h/this.skip),this.includeInvisiblePoints){for(k=C,l=D;l>k;k++)for(m=A,n=B;n>m;m++)if(u=4*(k*y+m),e[u+3]>0){for(q=0,r=0,s=0,o=0,p=h;p>o;o+=this.skip)v=m+x[o][0],w=k+x[o][1],v>=0&&y>v&&w>=0&&z>w&&(t=4*(w*y+v),q+=e[t],t++,r+=e[t],t++,s+=e[t]);0!==i&&(q/=i,r/=i,s/=i),g[u]=q,u++,g[u]=r,u++,g[u]=s,u++,g[u]=e[u]*d}}else for(k=C,l=D;l>k;k++)for(m=A,n=B;n>m;m++)if(u=4*(k*y+m),e[u+3]){for(q=0,r=0,s=0,j=0,o=0,p=h;p>o;o+=this.skip)v=m+x[o][0],w=k+x[o][1],v>=0&&y>v&&w>=0&&z>w&&(t=4*(w*y+v),e[t+3]>0&&(j++,q+=e[t],t++,r+=e[t],t++,s+=e[t]));0!==j&&(q/=j,r/=j,s/=j),g[u]=q,u++,g[u]=r,u++,g[u]=s,u++,g[u]=e[u]*d}return f},a.BlurFilter.prototype.getBrush=function(){var b,c,d,e,f,g,h,i,j,k,l,m;for(b=this.radiusX,c=this.radiusY,d=this.roll,e=b>c?b+2:c+2,f=Math.floor(e/2),g=Math.cos(d*a.work.radian),h=Math.sin(d*a.work.radian),i=[],j=a.work.filterCanvas,k=a.work.filterCvx,j.width=e,j.height=e,k.setTransform(g,h,-h,g,f,f),k.beginPath(),k.moveTo(-b,0),k.lineTo(-1,-1),k.lineTo(0,-c),k.lineTo(1,-1),k.lineTo(b,0),k.lineTo(1,1),k.lineTo(0,c),k.lineTo(-1,1),k.lineTo(-b,0),k.closePath(),l=0;e>l;l++)for(m=0;e>m;m++)k.isPointInPath(m,l)&&i.push([m-f,l-f,1]);return k.setTransform(1,0,0,1,0,0),i},a.LeachFilter=function(b){return b=a.safeObject(b),a.Filter.call(this,b),this.exclude=b.exclude||[],this.operation="xor",a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.LeachFilter.prototype=Object.create(a.Filter.prototype),a.LeachFilter.prototype.type="LeachFilter",a.LeachFilter.prototype.classname="filternames",a.work.d.LeachFilter={operation:"xor",exclude:[]},a.mergeInto(a.work.d.LeachFilter,a.work.d.Filter),a.LeachFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s=a.width,t=b.left,u=b.right,v=b.top,w=b.bottom,x=this.exclude;for(l=a.data,n=v;w>n;n++)for(o=t;u>o;o++)if(m=4*(n*s+o),l[m+3]){for(r=!1,c=l[m],d=l[m+1],e=l[m+2],p=0,q=x.length;q>p;p++)if(i=x[p][0],j=x[p][1],k=x[p][2],f=x[p][3],g=x[p][4],h=x[p][5],c>=i&&f>=c&&d>=j&&g>=d&&e>=k&&h>=e){r=!0;break}l[m+3]=r?255:0}return a},a.SeparateFilter=function(b){return b=a.safeObject(b),a.Filter.call(this,b),this.channel=a.xtGet(b.channel,"all"),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.SeparateFilter.prototype=Object.create(a.Filter.prototype),a.SeparateFilter.prototype.type="SeparateFilter",a.SeparateFilter.prototype.classname="filternames",a.work.d.SeparateFilter={channel:"all"},a.mergeInto(a.work.d.SeparateFilter,a.work.d.Filter),a.SeparateFilter.prototype.add=function(a,b){var c,d,e,f,g,h,i,j=a.width,k=b.left,l=b.right,m=b.top,n=b.bottom;for(i={red:function(a){a[f+1]=0,a[f+2]=0},green:function(a){a[f]=0,a[f+2]=0},blue:function(a){a[f]=0,a[f+1]=0},cyan:function(a){var b=(a[f+1]+a[f+2])/2;a[f]=0,a[f+1]=b,a[f+2]=b},magenta:function(a){var b=(a[f]+a[f+2])/2;a[f+1]=0,a[f]=b,a[f+2]=b},yellow:function(a){var b=(a[f]+a[f+1])/2;a[f+2]=0,a[f+1]=b,a[f]=b}},c=this.getAlpha(),d=this.channel,e=a.data,h=m;n>h;h++)for(g=k;l>g;g++)f=4*(h*j+g),e[f+3]&&(i[d](e),e[f+3]*=c);return a},a.NoiseFilter=function(b){var c=a.xtGet;return b=a.safeObject(b),a.Filter.call(this,b),this.radiusX=c(b.radiusX,2),this.radiusY=c(b.radiusY,2),this.roll=c(b.roll,2),this.cells=a.xt(b.cells)?b.cells:!1,this.strength=c(b.strength,.3),Array.isArray(this.cells)||(this.cells=this.getBrush()),a.filter[this.name]=this,a.pushUnique(a.filternames,this.name),this},a.NoiseFilter.prototype=Object.create(a.Filter.prototype),a.NoiseFilter.prototype.type="NoiseFilter",a.NoiseFilter.prototype.classname="filternames",a.work.d.NoiseFilter={radiusX:2,radiusY:2,roll:0,strength:.3},a.mergeInto(a.work.d.NoiseFilter,a.work.d.Filter),a.NoiseFilter.prototype.set=function(b){return a.BlurFilter.prototype.set.call(this,b)},a.NoiseFilter.prototype.getBrush=function(){return a.BlurFilter.prototype.getBrush.call(this)},a.NoiseFilter.prototype.add=function(b,c){var d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s=b.width,t=b.height,u=c.left,v=c.right,w=c.top,x=c.bottom,y=Math.random,z=Math.floor;for(d=this.getAlpha(),e=b.data,g=a.work.cvx.createImageData(s,t),f=g.data,h=this.strength,r=this.cells.length,i=w,j=x;j>i;i++)for(k=u,l=v;l>k;k++)n=4*(i*s+k),e[n+3]&&(y()<h?(q=this.cells[z(y()*r)],o=k+q[0],p=i+q[1],o>=0&&s>o&&p>=0&&t>p&&(m=4*(p*s+o),f[n]=e[m],f[n+1]=e[m+1],f[n+2]=e[m+2],f[n+3]=e[n+3]*d)):(f[n]=e[n],f[n+1]=e[n+1],f[n+2]=e[n+2],f[n+3]=e[n+3]*d));return g},a}(scrawl);