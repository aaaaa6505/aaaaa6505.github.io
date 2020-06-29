//nav滾動
(function() {
    var window_w = $(window).width();
    if(window_w <=992){
    $("#nav1").click(function(){
            var POS = $("#part1").position().top; 
            $("html, body").stop(true,false).animate({scrollTop:POS-"277"},500);//277是手機版navbar的高度含展開的選單高度50+227=277
            return false;
        });
      
    $("#nav2").click(function(){
            var POS = $("#part2").position().top; 
            $("html, body").stop(true,false).animate({scrollTop:POS-"277"},500);
            return false;
        });

    
    $("#nav0").click(function(){
      var POS = $("#top").position().top; 
      $("html, body").stop(true,false).animate({scrollTop:0},500);
        return false;
        });
  
    $(".fix-btn-mp").click(function(){
        var POS = $("#part3").position().top; 
        $("html, body").stop(true,false).animate({scrollTop:(POS-"277")},500);
        return false;
    });
        
    }else
    {
        $("#nav1").click(function(){
            var POS = $("#part1").position().top; 
            $("html, body").stop(true,false).animate({scrollTop:POS-"50"},500);//50是桌機版navbar的高度
            return false;
      });
      $("#nav2").click(function(){
            var POS = $("#part2").position().top; 
            $("html, body").stop(true,false).animate({scrollTop:POS-"50"},500);
            return false;
      });
        $("#nav0").click(function(){0
        $("html, body").stop(true,false).animate({scrollTop:0},500);
        return false;
        });
        $(".fix-btn-pc").click(function(){
            var POS = $("#part3").position().top; 
            $("html, body").stop(true,false).animate({scrollTop:(POS-"50")},500);
            return false;
        });
        $("#topPc").click(function(){
            $("html,body").animate({scrollTop:0},500);
            return false;
        });
      
    }
})();
//滾動後出現固定浮動button 
$(window).scroll(function() {
    if ($(this).scrollTop() > 30){  
        $('.fix-btn-pc').addClass("fx");
        $('.toppage-btn-pc').addClass("fx");
        $('.link-btn-pc').addClass("fx");
        $('.fix-btn-mp').addClass("fixed-bottom");
        $('.toppage-btn-mp').addClass("fx");
        $('.link-btn-mp').addClass("fx");
    }
    else{
        $('.fix-btn-pc').removeClass("fx");
        $('.toppage-btn-pc').removeClass("fx");
        $('.link-btn-pc').removeClass("fx");
        $('.fix-btn-mp').removeClass("fixed-bottom");
        $('.toppage-btn-mp').removeClass("fx");
        $('.link-btn-mp').removeClass("fx");
    }
});

  // 漢堡選單點選後，漢堡選單自動關閉
  
  $('.nav-item a').click(function(){
      if($(window).width()<=992){
      $('.navbar-toggler').trigger('click');
     }
  });

  
