var AndroidContacts = {
  /**  
  Create a contact
    @param {string} name - The contact name.
    @param {Arguments} options - Extra options
    You can specify extra contact options:
      {string} phone - The contact phone number.
      {string} email - The contact email address.
      {string} postal - The contact postal address.
      {string} company - The contact company.
      {string} jobTitle - The contact job title.
      {string} notes - The contact notes.
      
    @example
    AndroidContacts.create(  entry().field("Full name") , 
      {email:entry().field("Email"), notes:"from Memento"});
    */
    create: function(name, options) {
        i = intent("android.intent.action.INSERT");
        i.mimeType("vnd.android.cursor.dir/contact");
        i.extra("name", name);
        if (options !== undefined) {          
            if (options.phone !== undefined) 
              i.extra("phone" , options.phone);
            if (options.email !== undefined)
              i.extra("email" , options.email);
            if (options.postal !== undefined)
              i.extra("postal" , options.postal);
            if (options.company !== undefined)
              i.extra("company" , options.company);
            if (options.jobTitle !== undefined)
              i.extra("job_title" , options.jobTitle)
            if (options.notes !== undefined)
              i.extra("notes" , options.notes)   
        }
        i.send();
    }
}
