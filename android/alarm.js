var AndroidAlarm = {
/**
    Create an alarm
    @param {number} hour - The hour for the alarm.
    @param {number} minutes - The minutes for the alarm.
    @param {string} message - A custom message to identify the alarm.
    @param {Arguments} options - Extra options
    You can specify extra alarm options:
      {Array} days - An Array including each week day on which this alarm should be repeated. Each day must be declared with an integer.
      {bool} vibrate - A boolean specifying whether to vibrate for this alarm.
      {bool} skipUI - A boolean specifying whether the responding app should skip its UI when setting the alarm. 
      
    @example
    AndroidAlarm.create( 12 , 30 ,  "My alarm" , {days:[2,3], vibrate:true});
    */
    create: function(hour, minutes, message, options) {
        i = intent("android.intent.action.SET_ALARM");
        i.extraInt("android.intent.extra.alarm.HOUR", hour);
        i.extraInt("android.intent.extra.alarm.MINUTES", minutes);
        if (message !== undefined)
            i.extra("android.intent.extra.alarm.MESSAGE", message);
        if (options !== undefined) {
            if (options.days !== undefined)
                i.extraArrayInt("android.intent.extra.alarm.DAYS", options.days);
            if (options.vibrate !== undefined)
                i.extraBool("android.intent.extra.alarm.VIBRATE", options.vibrate);
            if (options.skipUI !== undefined)
                i.extraBool("android.intent.extra.alarm.SKIP_UI", options.skipUI);
        }
        i.send();
    },
    
   /**
    Create a timer
    @param {number} length - The length of the timer in seconds.
    @param {string} message -A custom message to identify the timer.
    @param {bool} skipUI - A boolean specifying whether the responding app should skip its UI when setting the timer. 
      
    @example
    AndroidAlarm.timer(30);
    */
    timer: function(length, message, skipUI) {
        i = intent("android.intent.action.SET_TIMER");
        i.extraInt("android.intent.extra.alarm.LENGTH", length);    
        if (message !== undefined)
            i.extra("android.intent.extra.alarm.MESSAGE", message);
        if (skipUI !== undefined)
            i.extraBool("android.intent.extra.alarm.SKIP_UI", skipUI);
        i.send();
    }
    
};
