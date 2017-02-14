var AndroidCalendar = {
    /**
    Add a calendar event
    @param {String} title - The event title
    @param {Arguments} options - Extra options
    You can then specify various event details using extra options:
      {String} desk - The event description
      {Date} begin - The start time of the event
      {Date} end - The end time of the event
      {bool} allDay - A boolean specifying whether this is an all-day event
      {String} location - The event location
      {Array} emails - Array of email addresses that specify the invitee
      
    @example
    AndroidCalendar.create( entry().field("Title") , {begin:new Date(), allDay:true});
    */
    create: function(title, options) {
        i = intent("android.intent.action.INSERT");
        i.data("content://com.android.calendar/events");
        i.extra("title", title);
        if (options !== undefined) {
            if (options.desc !== undefined)
                i.extra("description", options.desc);
            if (options.begin !== undefined)
                i.extraLong("beginTime", options.begin.getTime());
            if (options.end !== undefined)
                i.extraLong("endTime", options.end.getTime());
            if (options.location !== undefined) 
              i.extra("eventLocation", options.location);
            if (options.allDay !== undefined) 
              i.extraBool("allDay", options.allDay);
            if (options.emails != undefined) 
              i.extra("android.intent.extra.EMAIL", options.emails.join());
        }
        i.send();
    }
};
