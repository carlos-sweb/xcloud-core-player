/*!!
 * Xcloud  core-player.js <https://github.com/carlos-sweb/xcloud-core-player>
 * @author Carlos Illesca
 * @version 1.0.0 (2021/12/17 19:07 PM)
 * Released under the MIT License
 */
(function(factory) {

  var root = typeof self == 'object' && self.self === self && self ||
  typeof global == 'object' && global.global === global && global;

  if (typeof define === 'function' && define.amd) {
    // -------------------------------------------------------------------------
    define(
      [ 'ppIs' ,'ppEvents' , 'ppElement' , 'exports'],
      function(
        ppIs , ppEvents , ppElement , exports
      ){
      root.ppPlayer = factory(root, exports, ppIs, ppEvents,ppElement );
    });
    // -------------------------------------------------------------------------
  } else if (typeof exports !== 'undefined') {
    var ppIs = {}, ppEvents = {} , ppElement = {};
    try { ppIs = require('pp-is'); } catch (e) {}
    try { ppEvents = require('pp-events'); } catch (e) {}
    try { ppElement = require('pp-element'); } catch (e) {}
    factory(root, exports, ppIs , ppEvents, ppElement );
  } else {
    root.ppPlayer = factory(root, {},  root.ppIs , root.ppEvents, root.ppElement  );
  }

})(function( root , exports , _is , _events , _element  ) {
// =============================================================================
/**
 *@param {NodeElement} el - Elemento DOM para ser afectado
 *@param {String} src - Url del medio a reproducir
 *@param {Number} index - Url del medio a reproducir
 *@param {Boolean} show - true si se debe mostrar y falso si se debe ocultar
 * con las clases de css show y hide
 *@param {String} iden - Identificador del video tag A o B
 *@param {String} ID - numero identificador del playlist proveniente
 * de la api
 **/
  var getPlayerHtml = function( src , index , show , iden , ID){
      return  `<video data-id='${ID}' preload='auto' pp-player-id='${iden}' src='${src}' data-index='${index}' class='${show == true ? 'show':'hide'}'  ></video>`;
  }
  // ===========================================================================
  /**
   *@param {NodeElement} player - Elemento Dom tag video}
   *@param {Boolean} show - Estado del player show o hide
   * se agregan clases css
   **/
  var changeShowPlayer = function( player,  show  ){
    player.removeClass( (show === true ? "hide" :  "show") );
    player.addClass( (show === true ? "show" :  "hide") );
  }
  // ===========================================================================
  var ppPlayer = function( options ){
    // identificador del playlist
    this.ID = 0;
    // =========================================================================
    // identificador del playlist por actualizar
    this.ID_update = -1;
    // =========================================================================
    // manejador de eventos
    this.Event = new ppEvents();
    // =========================================================================
    // Estado para la actualización del playlist
    this.update = false;
    // =========================================================================
    // Contendor del urls para el playlist
    this.playlistUpdate = [];
    // =========================================================================
    /**
     * @description - Retorna el index que sigue del actual
     * para realizar un pre-carga del recurso
     * si el index a entregar supera el largo del playlist
     * retorna una posicion inicial 0 para reiniciar el playlist
     * @return
     * */
    this.nextIndex = function(){
      return (this.getIndex()+1) < this.playlistLength() ?
      (this.getIndex()+1) : 0;
    }
    // =========================================================================
    /**
     * @function waitForPlaylist
     * @description - function que esta en un loop ejecutandose
     * a si misma hasta que se entregue un playlist para actualizar
     * al momento de detectar la actualización se rompe el loop
     *
     * */
    this.waitForPlaylist = function(){
        setTimeout(function(){
            if( this.update ){
              this.applyUpdate();
              //Por que el applyUpdate establece el index en -1
              this.index = 0;
              this.containerReady();
            }else{
              this.waitForPlaylist();
            }
        }.bind(this),5000);
    }
    // =========================================================================
    /**
     * @function setPlaylistUpdate
     * @description - function que recibe el nuevo listado de url
     * para reproducir y ademas del identificador del playlist
     * @return void
     * */
    this.setPlaylistUpdate = function( newPlaylist , id ){
       _is.isArray(newPlaylist,function(value){
         this.update = true;
         this.playlistUpdate = value;
         this.ID_update = id;
       }.bind(this));
    }
    // =========================================================================
    /**
     * @function applyUpdate
     * @description - Function que se encarga de realizar la
     * actualización efectiva del nuevo playlist recibido
     * de la funcion setPlaylistUpdate
     * */
    this.applyUpdate = function(){
      if( this.update ){
        this.index = -1;
        this.playlist = this.playlistUpdate;
        this.update = false;
        this.ID = this.ID_update;
        if( this.playlistLength() == 0 ){
          this.container.html('');
          this.waitForPlaylist();
        }
      }
    }
    // =========================================================================
    /**
     * @function play
     * @description - Se encarga de acceder al tag video que tiene
     * la clase css show para dar play a la reproducción del video
     * */
    this.play = function(){
      var pShow = this.container.elem.querySelector("video.show");
      if( !_is.isNull(pShow) ){
        var player = ppElement( pShow );
        setTimeout(function(p){
          p.elem.play();
          this.Event.emit('trackPlay',{
            track:p.attr("src"),
            index:p.data("index"),
            ID: p.data("id")
          });
        }.bind(this,player),0);
      }
    }
    // =========================================================================
    this.Event.on('playlistEnd',this.applyUpdate.bind(this));
    // =========================================================================
    // Funcion que establece la posicion del indice de la
    // reproducción
    this.indexPlus = function(done){
      // Avanza el indice sin sobrepasar el largo
      // de la lista de reproducción
      this.index < ( this.playlistLength() -1   ) ?
      ( this.index++ ):(this.index=0);

      //Trabajando Aqui en este punto
      //
      this.index == ( this.playlistLength() -1   )  && (  this.Event.emit("playlistEnd")  );
      // Funcion que se ejecuta al realizar la verificación
      // y definición del indice
      if( _is.isFunction( done ) ){ done(); }
    }
    // =========================================================================
    // Funcion que retorna el indice
    this.getIndex = function(){
      return this.index;
    }
    // =========================================================================

    this.changePlayer = function( e ){

      var playerHide = ppElement(e.target.parentElement.querySelector("video.hide")),
      playerShow = ppElement(e.target);
      this.indexPlus(function AfterIndexPlus( pShow , pHide ){
        // =====================================================================
        // Cambiamos el estado del player
        // Se oculta el tag video que estaba reproduciendo
        changeShowPlayer( pShow , false );
        // La url del siguiente video
        var nextTrack = this.getTrack( this.nextIndex() );
        pShow.attr("src", nextTrack );
        // Set data index in tag video data-index="{index}"
        pShow.data("index",this.nextIndex());

        pShow.data("id") == this.ID.toString() ?
        void 0 : pShow.data("id",this.ID);

        // start preload video in tag video for play
        pShow.elem.preload = "auto";
        // Cambiamos el estado del player
        // =====================================================================
        changeShowPlayer( pHide , true );
        //=======================================================
        // Ya cambiado el indice y asiganda el siguiente video
        // damos play al siguiente video
        this.play(); // le da play al video.show
        // =====================================================================
      }.bind(this,playerShow,playerHide));
    }
    // =========================================================================
    this.containerReady = function(){
      if( this.playlistLength() > 0 ){
            // Verificamos que los tag video no esten creados
            var videoTag = this.container.elem.querySelectorAll("video.show,video.hide");
            if( videoTag.length == 0 ){
              var htmlText = getPlayerHtml( this.getTrack(this.getIndex()) , this.getIndex() , true , "A" , this.ID );
              htmlText +=getPlayerHtml( this.getTrack(this.nextIndex()) , this.nextIndex() , false , "B" , this.ID);
              // Insertando los tag video
              this.container.html(htmlText);
            }
            // ==========================================================
            // Escuchamos el evento que da termino a la reproducción del video
            this.container.elem.querySelectorAll("video")
            .forEach(function( pVideo ){
              pVideo.addEventListener('ended',this.changePlayer.bind(this));
            }.bind(this));
            // ==========================================================
            this.Event.emit("playlistReady");
      }else{
          this.waitForPlaylist();
      }
    }

    // ==========================================================
    this.Event.on('containerReady', this.containerReady.bind(this) );
    this.Event.on('playlistReady',this.play.bind(this));
    // ==========================================================
    /**
    *@name ppPlayer#index
    *@Number
    *@description - indice de reproducción de la lista de reproducción
    **/
    this.index = ppIs.isUndefined( options.index ) ? 0 : options.index ;
    /**
    *@name ppPlayer#container
    *@ElementNode
    *@description - contenedor html para las etiquetas video
    **/
    // ==========================================================
    this.container = null;
    // ==========================================================
    /**
    *@name ppPlayer#playlist
    *@array
    *@description -  Contenedor de las pistas a reproducir
   **/
    this.playlist = [];
    // ==========================================================
    /**
    *@name ppPlayer#getTrack
    *@function
    *@return Retorna la url de la pista a reproducir
   **/
    this.getTrack = function( at ){
        return this.playlist[at];
    }
    // ==========================================================
    this.playlistLength = function(){
      return this.playlist.length;
    }
    // ==========================================================
    ppIs.isArray(options.playlist,function(value){
      this.playlist = value;
    }.bind(this));
    // ==========================================================
    ppIs.isString( options.view , function(value){
      this.container = ppElement('[pp-player='+value+']');
      !ppIs.isNull(this.container) ? this.Event.emit('containerReady') : void 0;
    }.bind(this) )
    // ==========================================================
  }
  return ppPlayer;
});
