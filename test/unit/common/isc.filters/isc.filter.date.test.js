
(function(){
  'use strict';

  describe('iscDateFilter', function(){
    var scope,
        filter;

    // setup devlog
    beforeEach(module('isc.core', 'isc.filters', function (devlogProvider) {
      devlogProvider.loadConfig(customConfig);
    }));

    beforeEach( inject( function( $rootScope, $injector ){
      scope = $rootScope.$new();
      filter = $injector.get('$filter')('iscDate');

      //"2014-12-08 04:57:00" - expected format
    }));

    // -------------------------
    describe( 'date filter tests ', function(){

      it('should return empty string if not date object', function(){
        var dateStr = '';
        var actual = filter(dateStr);
        expect(actual).toBe('');
      });

      it('should return "1 day ago" when format is "fromNow"', function(){
        var dateStr = moment().subtract(1, 'day').toDate();
        var actual = filter(dateStr, 'fromNow');
        expect(actual).toBe('a day ago');
      });

      it( 'should return the right date string - some day', function(){
        var dateStr = '2014-12-07 04:57:00';
        var expected  = filter( dateStr );
        expect( expected ).toBe( 'December 7th, 2014 4:57 AM' );
      });

      it( 'should return the right date string - date', function(){
        var dateStr = '2014-12-07 04:57:00';
        var expected  = filter( dateStr, 'date' );
        expect( expected ).toBe( 'December 7th, 2014' );
      });

      it( 'should return the right date string - dateWithTime', function(){
        var dateStr = '2014-12-07 04:57:00';
        var expected = filter( dateStr, 'dateWithTime' );
        expect( expected ).toBe( '12/7/14 4:57 AM' );
      });

      it( 'should return the right date string - custom', function(){
        var dateStr = '2014-12-07 04:57:00';
        var expected  = filter( dateStr, 'l' );
        expect( expected ).toBe( '12/7/2014' );
      });

    });


  });
})();

