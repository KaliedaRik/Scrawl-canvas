/*! scrawl 2014-08-02 */
var scrawl=function(a){"use strict";return a.workcols={v1:a.newVector({name:"scrawl.workcols.v1"}),v2:a.newVector({name:"scrawl.workcols.v2"}),v3:a.newVector({name:"scrawl.workcols.v3"})},a.buildFields=function(b){var c=a.xt(b)?[].concat(b):[a.pad[a.currentPad].current];"all"===b&&(c=a.cellnames);for(var d=0,e=c.length;e>d;d++)a.cell[c[d]].buildField();return!0},a.Pad.prototype.buildFields=function(){for(var b=0,c=this.cells.length;c>b;b++)a.cell[this.cells[b]].buildField();return this},a.Cell.prototype.collisionsCellInit=function(b){a.newGroup({name:this.name+"_field",cell:this.name,visibility:!1}),b.field&&(a.group[this.name+"_field"].sprites=[].concat(b.field)),a.newGroup({name:this.name+"_fence",cell:this.name,visibility:!1}),b.fence&&(a.group[this.name+"_fence"].sprites=[].concat(b.fence))},a.d.Cell.fieldLabel="",a.Cell.prototype.buildField=function(){var b,c,d=[],e=[],f="",g=a.ctx[this.context].get("fillStyle");a.context[this.context].fillStyle="rgba(0,0,0,1)",a.context[this.context].fillRect(0,0,this.actualWidth,this.actualHeight),a.context[this.context].fillStyle=g,d=a.group[this.name+"_field"].sprites;for(var h=0,i=d.length;i>h;h++)f=a.sprite[d[h]],b=a.ctx[f.context].fillStyle,c=a.ctx[f.context].strokeStyle,a.ctx[f.context].fillStyle="rgba(255,255,255,1)",a.ctx[f.context].strokeStyle="rgba(255,255,255,1)",f.forceStamp("fillDraw",this.name),a.ctx[f.context].fillStyle=b,a.ctx[f.context].strokeStyle=c;e=a.group[this.name+"_fence"].sprites;for(var j=0,k=e.length;k>j;j++)f=a.sprite[e[j]],b=a.ctx[f.context].fillStyle,c=a.ctx[f.context].strokeStyle,a.ctx[f.context].fillStyle="rgba(0,0,0,1)",a.ctx[f.context].strokeStyle="rgba(0,0,0,1)",f.forceStamp("fillDraw",this.name),a.ctx[f.context].fillStyle=b,a.ctx[f.context].strokeStyle=c;return this.set({fieldLabel:this.getImageData({name:"field"})}),this},a.Cell.prototype.checkFieldAt=function(b){b=a.safeObject(b);var c,d,e,f,g=b.channel||"anycolor",h=b.test||0,i=b.coordinates?b.coordinates:[b.x||0,b.y||0],j=this.get("fieldLabel");f=a.imageData[j];for(var k=0,l=i.length;l>k;k+=2){if(c=Math.round(i[k]),d=Math.round(i[k+1]),!a.isBetween(c,0,f.width,!0)||!a.isBetween(d,0,f.height,!0))return!1;switch(e=4*(d*f.width+c),g){case"red":if(f.data[e]<=h)return{x:c,y:d};break;case"green":if(f.data[e+1]<=h)return{x:c,y:d};break;case"blue":if(f.data[e+2]<=h)return{x:c,y:d};break;case"alpha":if(f.data[e+3]<=h)return{x:c,y:d};break;case"anycolor":if(f.data[e]<=h||f.data[e+1]<=h||f.data[e+2]<=h)return{x:c,y:d}}}return!0},a.Group.prototype.getSpritesCollidingWith=function(b){if(b=a.isa(b,"str")?a.sprite[b]:b,a.contains(a.spritenames,b.name)){for(var c=[],d=b.getCollisionPoints(),e=0,f=this.sprites.length;f>e;e++)a.sprite[this.sprites[e]].name!==b.name&&a.sprite[this.sprites[e]].get("visibility")&&a.sprite[this.sprites[e]].checkHit({tests:d})&&c.push(this.sprites[e]);return c.length>0?c:!1}return!1},a.Group.prototype.getInGroupSpriteHits=function(){for(var b,c,d,e,f=[],g={},h={},i=0,j=this.sprites.length;j>i;i++)b=a.sprite[this.sprites[i]],h[b.name]=b.visibility,h[b.name]&&(g[b.name]=b.getCollisionPoints());for(var k=0,l=this.sprites.length;l>k;k++)if(h[this.sprites[k]])for(var m=k+1,n=this.sprites.length;n>m;m++)if(h[this.sprites[m]]){if(this.regionRadius&&(c=a.workcols.v1.set(a.sprite[this.sprites[k]].start),d=a.workcols.v2.set(a.sprite[this.sprites[m]].start),e=c.vectorSubtract(d).getMagnitude(),e>this.regionRadius))continue;if(a.sprite[this.sprites[m]].checkHit({tests:g[this.sprites[k]]})){f.push([this.sprites[k],this.sprites[m]]);continue}if(a.sprite[this.sprites[k]].checkHit({tests:g[this.sprites[m]]})){f.push([this.sprites[k],this.sprites[m]]);continue}}return f},a.Group.prototype.getBetweenGroupSpriteHits=function(b){var c,d,e,f,g=[],h={},i={};if(a.xt(b)){if(a.isa(b,"str")){if(!a.contains(a.groupnames,b))return!1;b=a.group[b]}else if(!a.xt(b.type)||"Group"!==b.type)return!1;for(var j=0,k=this.sprites.length;k>j;j++)c=a.sprite[this.sprites[j]],i[c.name]=c.visibility,i[c.name]&&(h[c.name]=c.getCollisionPoints());for(var l=0,m=b.sprites.length;m>l;l++)c=a.sprite[b.sprites[l]],i[c.name]=c.visibility,i[c.name]&&(h[c.name]=c.getCollisionPoints());for(var n=0,o=this.sprites.length;o>n;n++)if(i[this.sprites[n]])for(var p=0,q=b.sprites.length;q>p;p++)if(i[b.sprites[p]]){if(this.regionRadius&&(d=a.workcols.v1.set(a.sprite[this.sprites[n]].start),e=a.workcols.v2.set(a.sprite[b.sprites[p]].start),f=d.vectorSubtract(e).getMagnitude(),f>this.regionRadius))continue;if(a.sprite[b.sprites[p]].checkHit({tests:h[this.sprites[n]]})){g.push([this.sprites[n],b.sprites[p]]);continue}if(a.sprite[this.sprites[n]].checkHit({tests:h[b.sprites[p]]})){g.push([this.sprites[n],b.sprites[p]]);continue}}return g}return!1},a.Group.prototype.getFieldSpriteHits=function(b){b=a.xt(b)?b:this.cell;for(var c,d=[],e=0,f=this.sprites.length;f>e;e++)c=a.sprite[this.sprites[e]].checkField(b),a.isa(c,"bool")||d.push([this.sprites[e],c]);return d},a.d.Sprite.fieldChannel="anycolor",a.d.Sprite.fieldTest=0,a.d.Sprite.collisionVectors=[],a.d.Sprite.collisionPoints=[],a.xt(a.d.Block)&&a.mergeInto(a.d.Block,a.d.Sprite),a.xt(a.d.Shape)&&a.mergeInto(a.d.Shape,a.d.Sprite),a.xt(a.d.Wheel)&&a.mergeInto(a.d.Wheel,a.d.Sprite),a.xt(a.d.Picture)&&a.mergeInto(a.d.Picture,a.d.Sprite),a.xt(a.d.Phrase)&&a.mergeInto(a.d.Phrase,a.d.Sprite),a.xt(a.d.Path)&&a.mergeInto(a.d.Path,a.d.Sprite),a.Sprite.prototype.collisionsSpriteConstructor=function(b){a.xt(b.field)&&this.addSpriteToCellFields(),a.xt(b.fence)&&this.addSpriteToCellFences()},a.Sprite.prototype.collisionsSpriteRegisterInLibrary=function(){return a.xt(this.collisionPoints)&&(this.collisionPoints=a.isa(this.collisionPoints,"arr")?this.collisionPoints:[this.collisionPoints],this.collisionPoints=this.parseCollisionPoints(this.collisionPoints)),this},a.Sprite.prototype.collisionsSpriteSet=function(b){a.xto([b.collisionPoints,b.field,b.fence])&&(a.xt(b.collisionPoints)&&(this.collisionPoints=a.isa(b.collisionPoints,"arr")?b.collisionPoints:[b.collisionPoints],this.collisionPoints=this.parseCollisionPoints(this.collisionPoints),delete this.collisionVectors),a.xt(b.field)&&this.addSpriteToCellFields(),a.xt(b.fence)&&this.addSpriteToCellFences())},a.Sprite.prototype.addSpriteToCellFields=function(b){b=a.xt(b)?[].concat(b):[this.group];for(var c=0,d=b.length;d>c;c++)a.contains(a.cellnames,b[c])&&a.group[b[c]+"_field"].addSpritesToGroup(this.name);return this},a.Sprite.prototype.addSpriteToCellFences=function(b){b=a.xt(b)?[].concat(b):[this.group];for(var c=0,d=b.length;d>c;c++)a.contains(a.cellnames,b[c])&&a.group[b[c]+"_fence"].addSpritesToGroup(this.name);return this},a.Sprite.prototype.removeSpriteFromCellFields=function(b){b=a.xt(b)?[].concat(b):[this.group];for(var c=0,d=b.length;d>c;c++)a.contains(a.cellnames,b[c])&&a.group[b[c]+"_field"].removeSpritesFromGroup(this.name);return this},a.Sprite.prototype.removeSpriteFromCellFences=function(b){b=a.xt(b)?[].concat(b):[this.group];for(var c=0,d=b.length;d>c;c++)a.contains(a.cellnames,b[c])&&a.group[b[c]+"_fence"].removeSpritesFromGroup(this.name);return this},a.Sprite.prototype.checkField=function(b){var c=b?a.cell[b]:a.cell[a.group[this.group].cell];return c.checkFieldAt({coordinates:this.getCollisionPoints(),test:this.get("fieldTest"),channel:this.get("fieldChannel")})},a.Sprite.prototype.getCollisionPoints=function(){var b,c,d=[];if(a.xt(this.collisionVectors)||a.xt(this.collisionPoints)&&this.buildCollisionVectors(),c=this.collisionVectors||!1){for(var e=0,f=c.length;f>e;e+=2)b=a.v,b.x=this.flipReverse?-c[e]:c[e],b.y=this.flipUpend?-c[e+1]:c[e+1],this.roll&&b.rotate(this.roll),1!==this.scale&&b.scalarMultiply(this.scale),b.vectorAdd(this.start),d.push(b.x),d.push(b.y);return d}return[]},a.Sprite.prototype.buildCollisionVectors=function(b){for(var c=a.xt(b)?this.parseCollisionPoints(b):this.collisionPoints,d=this.getOffsetStartVector().reverse(),e=this.width,f=this.height,g=[],h=0,i=c.length;i>h;h++)if(a.isa(c[h],"str"))switch(c[h]){case"start":g.push(0),g.push(0);break;case"N":g.push(e/2-d.x),g.push(-d.y);break;case"NE":g.push(e-d.x),g.push(-d.y);break;case"E":g.push(e-d.x),g.push(f/2-d.y);break;case"SE":g.push(e-d.x),g.push(f-d.y);break;case"S":g.push(e/2-d.x),g.push(f-d.y);break;case"SW":g.push(-d.x),g.push(f-d.y);break;case"W":g.push(-d.x),g.push(f/2-d.y);break;case"NW":g.push(-d.x),g.push(-d.y);break;case"center":g.push(e/2-d.x),g.push(f/2-d.y)}else a.isa(c[h],"vector")&&(g.push(c[h].x),g.push(c[h].y));return this.collisionVectors=g,this},a.Sprite.prototype.parseCollisionPoints=function(b){for(var c=a.xt(b)?[].concat(b):[],d=[],e=0,f=c.length;f>e;e++)if(a.isa(c[e],"str"))switch(c[e].toLowerCase()){case"all":a.pushUnique(d,"N"),a.pushUnique(d,"NE"),a.pushUnique(d,"E"),a.pushUnique(d,"SE"),a.pushUnique(d,"S"),a.pushUnique(d,"SW"),a.pushUnique(d,"W"),a.pushUnique(d,"NW"),a.pushUnique(d,"start"),a.pushUnique(d,"center");break;case"corners":a.pushUnique(d,"NE"),a.pushUnique(d,"SE"),a.pushUnique(d,"SW"),a.pushUnique(d,"NW");break;case"edges":a.pushUnique(d,"N"),a.pushUnique(d,"E"),a.pushUnique(d,"S"),a.pushUnique(d,"W");break;case"perimeter":a.pushUnique(d,"N"),a.pushUnique(d,"NE"),a.pushUnique(d,"E"),a.pushUnique(d,"SE"),a.pushUnique(d,"S"),a.pushUnique(d,"SW"),a.pushUnique(d,"W"),a.pushUnique(d,"NW");break;case"north":case"n":a.pushUnique(d,"N");break;case"northeast":case"ne":a.pushUnique(d,"NE");break;case"east":case"e":a.pushUnique(d,"E");break;case"southeast":case"se":a.pushUnique(d,"SE");break;case"south":case"s":a.pushUnique(d,"S");break;case"southwest":case"sw":a.pushUnique(d,"SW");break;case"west":case"w":a.pushUnique(d,"W");break;case"northwest":case"nw":a.pushUnique(d,"NW");break;case"start":a.pushUnique(d,"start");break;case"center":a.pushUnique(d,"center")}else a.isa(c[e],"num")?d.push(c[e]):a.isa(c[e],"vector")&&d.push(c[e]);return this.collisionPoints=d,d},a}(scrawl);