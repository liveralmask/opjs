var opjs = this;

/* Pure JavaScripts */

(function( vars ){
  var s_vars = {};
  
  vars.set = function( key, value ){
    s_vars[ key ] = value;
  };
  
  vars.get = function( key ){
    return s_vars[ key ];
  };
})(opjs.vars = opjs.vars || {});

(function( string ){
  string.format = function(){
    var args = Array.prototype.slice.call( arguments );
    var head = "";
    var tail = args.shift();
    var args_len = args.length;
    var pattern = new opjs.Pattern( undefined, "\{([0-9]+)\}" );
    while ( "" !== tail ){
      var match = pattern.match( tail );
      if ( null === match ) break;
      
      var index = Number( match.matches[ 1 ] );
      head += ( index < args_len ) ? match.head + args[ index ] : match.matches[ 0 ];
      tail = match.tail;
    }
    return head + tail;
  };
  
  string.multi = function( value, count ){
    var array = [];
    for ( var i = 0; i < count; ++i ){
      array.push( value );
    }
    return array.join( "" );
  };
  
  string.padding_zero = function( digit, value ){
    return ( string.multi( "0", digit ) + value ).slice( - digit );
  };
  
  string.replace = function( format, values ){
    var head = "";
    var tail = format;
    var pattern = new opjs.Pattern( undefined, "\{([a-zA-Z0-9_]+)\}" );
    while ( "" !== tail ){
      var match = pattern.match( tail );
      if ( null === match ) break;
      
      var key = match.matches[ 1 ];
      head += ( key in values ) ? match.head + values[ key ] : match.matches[ 0 ];
      tail = match.tail;
    }
    return head + tail;
  };
})(opjs.string = opjs.string || {});

opjs.Pattern = function( value, pattern, flags ){
  this.m_value = value;
  this.m_regex = new RegExp( pattern, flags );
};
opjs.Pattern.prototype.match = function( value ){
  var matches = this.m_regex.exec( value );
  return ( null === matches ) ? null : { value : this.m_value, matches : matches, head : RegExp.leftContext, tail : RegExp.rightContext };
};

(function( pattern ){
  var s_patterns = {};
  
  pattern.add = function( type, name, pattern, flags ){
    var add_value = new opjs.Pattern( name, pattern, flags );
    if ( type in s_patterns ){
      s_patterns[ type ].push( add_value );
    }else{
      s_patterns[ type ] = [ add_value ];
    }
  };
  
  pattern.match = function( type, value ){
    if ( undefined === s_patterns[ type ] ) return null;
    
    var patterns_len = s_patterns[ type ].length;
    for ( var i = 0; i < patterns_len; ++i ){
      var result = s_patterns[ type ][ i ].match( value );
      if ( null !== result ) return result;
    }
    return null;
  };
  
  pattern.matches = function( type, value ){
    if ( undefined === s_patterns[ type ] ) return [];
    
  　var matches = [];
    var patterns_len = s_patterns[ type ].length;
    for ( var i = 0; i < patterns_len; ++i ){
      var result = s_patterns[ type ][ i ].match( value );
      if ( null !== result ) matches.push( result );
    }
    return matches;
  };
})(opjs.pattern = opjs.pattern || {});

(function( json ){
  json.encode = function( value ){
    return JSON.stringify( value );
  };
  
  json.decode = function( value ){
    var pattern = new opjs.Pattern( undefined, "([0-9]{4})/([0-9]{2})/([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2}).([0-9]{3})" );
    return JSON.parse( value, function( k, v ){
      var match = pattern.match( v );
      return ( null === match ) ? v : opjs.time.local_time.apply( opjs.time, match.matches.slice( 1 ) );
    });
  };
})(opjs.json = opjs.json || {});

(function( time ){
  time.LocalTime = function( year, month, date, hour, min, sec, msec ){
    if ( typeof hour === "undefined" ) hour = 0;
    if ( typeof min === "undefined" )  min = 0;
    if ( typeof sec === "undefined" )  sec = 0;
    if ( typeof msec === "undefined" ) msec = 0;
    
    var value = ( typeof year === "undefined" ) ? new Date() : new Date( year, month - 1, date, hour, min, sec, msec );
    
    this.m_value = value;
  };
  time.LocalTime.prototype.year = function(){
    return this.m_value.getFullYear();
  };
  time.LocalTime.prototype.month = function(){
    return this.m_value.getMonth() + 1;
  };
  time.LocalTime.prototype.date = function(){
    return this.m_value.getDate();
  };
  time.LocalTime.prototype.day = function(){
    return this.m_value.getDay();
  };
  time.LocalTime.prototype.hour = function(){
    return this.m_value.getHours();
  };
  time.LocalTime.prototype.min = function(){
    return this.m_value.getMinutes();
  };
  time.LocalTime.prototype.sec = function(){
    return this.m_value.getSeconds();
  };
  time.LocalTime.prototype.msec = function(){
    return this.m_value.getMilliseconds();
  };
  time.LocalTime.prototype.toString = function(){
    return time.format( "all", this );
  };
  time.LocalTime.prototype.toJSON = function(){
    return this.toString();
  };
  time.LocalTime.prototype.is_same_date = function( local_time ){
    if ( this.date() != local_time.date() ) return false;
    if ( this.month() != local_time.month() ) return false;
    if ( this.year() != local_time.year() ) return false;
    return true;
  };
  
  time.local_time = function( year, month, date, hour, min, sec, msec ){
    return new time.LocalTime( year, month, date, hour, min, sec, msec );
  };
  
  time.first_date_time = function( year, month ){
    return time.local_time( year, month, 1 );
  };
  
  time.last_date_time = function( year, month ){
    return time.local_time( year, month + 1, 0 );
  };
  
  time.format = function( type, local_time ){
    if ( typeof local_time === "undefined" ) local_time = time.local_time();
    
    var value = "";
    switch ( type ){
    case "all":{
      value = opjs.string.format( "{0}/{1}/{2} {3}:{4}:{5}.{6}",
        local_time.year(),
        opjs.string.padding_zero( 2, local_time.month() ),
        opjs.string.padding_zero( 2, local_time.date() ),
        opjs.string.padding_zero( 2, local_time.hour() ),
        opjs.string.padding_zero( 2, local_time.min() ),
        opjs.string.padding_zero( 2, local_time.sec() ),
        opjs.string.padding_zero( 3, local_time.msec() ) );
    }break;
    
    case "ymdhms":{
      value = opjs.string.format( "{0}/{1}/{2} {3}:{4}:{5}",
        local_time.year(),
        opjs.string.padding_zero( 2, local_time.month() ),
        opjs.string.padding_zero( 2, local_time.date() ),
        opjs.string.padding_zero( 2, local_time.hour() ),
        opjs.string.padding_zero( 2, local_time.min() ),
        opjs.string.padding_zero( 2, local_time.sec() ) );
    }break;
    
    case "ymdhm":{
      value = opjs.string.format( "{0}/{1}/{2} {3}:{4}",
        local_time.year(),
        opjs.string.padding_zero( 2, local_time.month() ),
        opjs.string.padding_zero( 2, local_time.date() ),
        opjs.string.padding_zero( 2, local_time.hour() ),
        opjs.string.padding_zero( 2, local_time.min() ) );
    }break;
    
    case "ymd":{
      value = opjs.string.format( "{0}/{1}/{2}",
        local_time.year(),
        opjs.string.padding_zero( 2, local_time.month() ),
        opjs.string.padding_zero( 2, local_time.date() ) );
    }break;
    
    case "YMD":{
      value = opjs.string.format( "{0}{1}{2}",
        local_time.year(),
        opjs.string.padding_zero( 2, local_time.month() ),
        opjs.string.padding_zero( 2, local_time.date() ) );
    }break;
    
    case "hms":{
      value = opjs.string.format( "{0}:{1}:{2}",
        opjs.string.padding_zero( 2, local_time.hour() ),
        opjs.string.padding_zero( 2, local_time.min() ),
        opjs.string.padding_zero( 2, local_time.sec() ) );
    }break;
    
    case "HMS":{
      value = opjs.string.format( "{0}{1}{2}",
        opjs.string.padding_zero( 2, local_time.hour() ),
        opjs.string.padding_zero( 2, local_time.min() ),
        opjs.string.padding_zero( 2, local_time.sec() ) );
    }break;
    
    case "hm":{
      value = opjs.string.format( "{0}:{1}",
        opjs.string.padding_zero( 2, local_time.hour() ),
        opjs.string.padding_zero( 2, local_time.min() ) );
    }break;
    
    case "HM":{
      value = opjs.string.format( "{0}{1}",
        opjs.string.padding_zero( 2, local_time.hour() ),
        opjs.string.padding_zero( 2, local_time.min() ) );
    }break;
    }
    return value;
  };
  
  time.string_days = function(){
    return [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
  };
  
  time.holiday = function( year, month, date, day, holidays ){
    if ( typeof holidays === "undefined" ) holidays = {};
    
    do{
      if ( ! ( year in holidays ) ) break;
      if ( ! ( month in holidays[ year ] ) ) break;
      if ( ! ( date in holidays[ year ][ month ] ) ) break;
      return holidays[ year ][ month ][ date ];
    }while ( false );
    return "";
  };
  
  time.date = function( year, month, date, day, holidays ){
    return {
      year    : year,
      month   : month,
      date    : date,
      day     : day,
      holiday : opjs.time.holiday( year, month, date, ( "index" in day ) ? day.index : day, holidays ),
    };
  };
  
  time.dates = function( year, month, string_days ){
    if ( typeof string_days === "undefined" ) string_days = time.string_days();
    
    var dates = [];
    var first_date_time = time.first_date_time( year, month );
    var last_date_time = time.last_date_time( year, month );
    var last_date = last_date_time.date();
    var day = first_date_time.day();
    for ( var date = 1; date <= last_date; ++date, day = time.add_day( day ) ){
      dates.push({ date : date, day : { index : day, string : string_days[ day ] } });
    }
    return dates;
  };
  
  time.add_day = function( base, add ){
    if ( typeof add === "undefined" ) add = 1;
    
    return ( base + add ) % 7;
  };
})(opjs.time = opjs.time || {});

(function( method ){
  method.call = function(){
    var args = Array.prototype.slice.call( arguments );
    var instance = args.shift();
    var name = args.shift();
    return ( undefined === instance[ name ] ) ? undefined : instance[ name ].apply( instance, args );
  };
})(opjs.method = opjs.method || {});

(function( object ){
  object.inherits = function( self, parent ){
    var keys = Object.keys( parent );
    var keys_len = keys.length;
    if ( 0 === keys_len ){
      self.prototype = new parent();
    }else{
      for ( var i = 0; i < keys_len; ++i ){
        var key = keys[ i ];
        
        self[ key ] = parent[ key ];
      }
    }
  };
})(opjs.object = opjs.object || {});

opjs.Application = function(){
  this.m_is_update = false;
  this.m_request = {};
  this.m_response = {};
};
opjs.Application.prototype.is_update = function(){
  if ( 1 == arguments.length ) this.m_is_update = arguments[ 0 ];
  return this.m_is_update;
};
opjs.Application.prototype.request = function(){
  if ( 1 == arguments.length ) this.m_request = arguments[ 0 ];
  return this.m_request;
};
opjs.Application.prototype.response = function(){
  if ( 1 == arguments.length ) this.m_response = arguments[ 0 ];
  return this.m_response;
};
opjs.Application.prototype.start = function(){};
opjs.Application.prototype.update = function(){};
opjs.Application.prototype.end = function(){};

(function( application ){
  application.run = function( application_type, request ){
    if ( typeof request === "undefined" ) request = {};
    
    var _application = null;
    try{
      _application = new application_type();
      _application.request( request );
      _application.start();
      if ( _application.is_update() ) _application.update();
      _application.end();
    }catch ( err ){
      opjs.log.err( opjs.string.format( "{0}\n{1}\n{2}", err, err.stack, opjs.json.encode( request ) ) );
      _application.response( null );
    }
    return ( null !== _application ) ? _application.response() : null;
  };
  
  application.rules_to_array = function( rules, title ){
    var array = ( typeof title === "undefined" ) ? [] : [ title ];
    var rules_len = rules.length;
    for ( var i = 0; i < rules_len; ++i ){
      var rule = rules[ i ];
      array.push( opjs.string.format( "{0} /{1}/{2}", rule.name, rule.pattern, rule.flags ) );
    }
    return array;
  };
})(opjs.application = opjs.application || {});

opjs.Log = function(){
  
};
opjs.Log.prototype.write = function( type, msg ){};

(function( log ){
  var s_log = null;
  log.log = function( value ){
    if ( 1 == arguments.length ) s_log = value;
    return s_log;
  };
  
  log.timestamp = function( local_time ){
    if ( typeof local_time === "undefined" ) local_time = opjs.time.local_time();
    
    return opjs.string.format( "[{0}]", opjs.time.format( "all", local_time ) );
  };
  
  log.write = function( type, msg ){
    if ( null !== s_log ) s_log.write( type, msg );
  };
  
  log.dbg = function(){
    var msg = opjs.string.format.apply( null, Array.prototype.slice.call( arguments ) );
    log.write( "dbg", msg );
  };
  
  log.inf = function(){
    var msg = opjs.string.format.apply( null, Array.prototype.slice.call( arguments ) );
    log.write( "inf", msg );
  };
  
  log.wrn = function(){
    var msg = opjs.string.format.apply( null, Array.prototype.slice.call( arguments ) );
    log.write( "wrn", msg );
  };
  
  log.err = function(){
    var msg = opjs.string.format.apply( null, Array.prototype.slice.call( arguments ) );
    log.write( "err", msg );
  };
})(opjs.log = opjs.log || {});

(function( dom ){
  var s_document = document;
  dom.document = function(){
    if ( 1 == arguments.length ) s_document = arguments[ 0 ];
    return s_document;
  };
})(opjs.dom = opjs.dom || {});

(function( element ){
  element.create = function( tag_name, attributes, values ){
    var _element = opjs.dom.document().createElement( tag_name );
    var attr_keys = Object.keys( attributes );
    var attr_keys_len = attr_keys.length;
    for ( var i = 0; i < attr_keys_len; ++i ){
      var attr_key = attr_keys[ i ];
      
      element.attr( _element, attr_key, attributes[ attr_key ] );
    }
    if ( "text" in values ){
      element.text( _element, values.text );
    }else if ( "html" in values ){
      element.html( _element, values.html );
    }
    return _element;
  };
  
  element.attr = function(){
    var args = Array.prototype.slice.call( arguments );
    var _element = args.shift();
    var key = args.shift();
    if ( 1 == args.length ) _element.setAttribute( key, args[ 0 ] );
    return _element.getAttribute( key );
  };
  
  element.text = function(){
    var args = Array.prototype.slice.call( arguments );
    var _element = args.shift();
    if ( 1 == args.length ) _element.textContent = args[ 0 ];
    return _element.textContent;
  };
  
  element.html = function(){
    var args = Array.prototype.slice.call( arguments );
    var _element = args.shift();
    if ( 1 == args.length ) _element.innerHTML = args[ 0 ];
    return _element.innerHTML;
  };
})(opjs.dom.element = opjs.dom.element || {});
