/*!!
 * Power Panel player.js <https://github.com/carlos-sweb/pp-player.js>
 * @author Carlos Illesca
 * @version 1.0.0 (2021/12/15 23:02 PM)
 * Released under the MIT License
 */
(function(factory) {
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global;
  if (typeof define === 'function' && define.amd) {
    define(['ppIs' ,'ppEvents' , 'ppElement' , 'exports'], function(ppIs,ppEvents,ppElement,exports) {
      root.ppElement = factory(root, exports, ppIs, ppEvents,ppElement );
    });
  } else if (typeof exports !== 'undefined') {
    var ppIs = {}, ppEvents={},ppElement={};
    try { ppIs = require('pp-is'); } catch (e) {}
    try { ppEvents = require('pp-events'); } catch (e) {}
    try { ppElement = require('pp-element'); } catch (e) {}
    factory(root, exports, ppIs , ppEvents, ppElement );
  } else {
    root.ppPlayer = factory(root, {},  root.ppIs , root.ppEvents, root.ppElement  );
  }

})(function( root , exports , _is , _events , _element  ) {


  var ppPlayer = function( options ){

    this.Event = new ppEvents();

    this.indexPlus = function(){
      this.index < ( this.playlistLength() -1   ) ?
      ( this.index++ ):(this.index=0);
    }

    this.getIndex = function(){
      return this.index;
    }


    this.changePlayer = function( playerShow , playerHide ){

      this.indexPlus();
      playerShow.removeClass("show");
      playerShow.addClass("hide");
      playerShow.attr("src",null);
      playerShow.attr("src", this.getTrack( this.getIndex() ) );
      playerShow.elem.preload = "auto";
      playerHide.removeClass("hide");
      playerHide.addClass("show");
      setTimeout(() => {
        playerHide.elem.play();
      });

    }


    this.containerReady = function(){

      if( this.playlistLength() > 0 ){
          if( this.playlistLength() == 1 ){
            this.container.html('<video class="show" pp-player-id="A" src="'+this.getTrack(this.index)+'" ></video>');
            this.playerA = ppElement( this.container.elem.querySelector("video[pp-player-id=A]") );
            this.playerA.elem.play()
            this.playerA.elem.loop = true;
          }else{

            this.container.html('<video class="show" pp-player-id="A" src="'+this.getTrack(this.index)+'" ></video><video class="hide" pp-player-id="B" src="'+this.getTrack(this.index+1)+'" ></video>');
            this.index++;
            this.playerA = ppElement( this.container.elem.querySelector("video[pp-player-id=A]") );
            this.playerA.elem.play()
            this.playerB = ppElement( this.container.elem.querySelector("video[pp-player-id=B]") );
            this.playerB.elem.preload = "auto";

            this.playerA.on("ended",function(event){
                  this.changePlayer( this.playerA , this.playerB );
            }.bind(this));

            this.playerB.on("ended",function(event){
              this.changePlayer( this.playerB , this.playerA );
            }.bind(this));

          }
      }
    }


    this.Event.on('containerReady', this.containerReady.bind(this) );

    this.index = ppIs.isUndefined( options.index ) ? 0 : options.index ;

    this.container = null;

    this.playlist = [];

    this.getTrack = function( at ){
        return this.playlist[at];
    }

    this.playlistLength = function(){
      return this.playlist.length;
    }

    ppIs.isArray(options.playlist,function(value){
      this.playlist = value;
    }.bind(this));

    ppIs.isString( options.view , function(value){
      this.container = ppElement('[pp-player='+value+']');
      !ppIs.isNull(this.container) ? this.Event.emit('containerReady') : void 0;
    }.bind(this) )

  }


  return ppPlayer;


})
