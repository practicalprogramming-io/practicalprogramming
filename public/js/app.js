(function () {

  function magicHeader () {
    var titleMagic = $('.jumbotron .container h1 .magic')
      , headers = ['developers', 'teachers', 'students', 'dreamers', 'thinkers',
        'professionals', 'experts', 'job seekers', 'tinkerers', 'novices',
        'engineers', 'artists', 'employers']
      , random = Math.floor(Math.random()*headers.length)
    ;

    function abracadabra (word, callback) {
      var length = word.length
        , letters = word.split('')
      ;

      function recurse (letter) {
        setTimeout(function () {
          var magicText = titleMagic.text()
            , nextLetter = letters.shift()
          ;

          function remove() {
            magicText = magicText.substring(0, magicText.length - 1);
            titleMagic.html(magicText);
            recurse();
          }

          if (letter) {
            magicText += letter
            titleMagic.html(magicText);
            recurse(nextLetter);
          }
          else if (!letter && headers.indexOf(magicText) > -1) {
            setTimeout(function () {
              remove();
            }, 1500);
          }
          else if (!letter && magicText.length > 0) {
            remove();
          }
          else {
            random = (random + 1 < headers.length) ? random + 1 : 0;
            abracadabra(headers[random]);
          }
        }, 200);
      }

      recurse(letters.shift());

    }

    abracadabra(headers[random]);

  }

  magicHeader();

})(this);
