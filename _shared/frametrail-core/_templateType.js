FrameTrail.defineType(

    'Person',   // Name of Type

    function (FrameTrail) {
        return {

            // parent type (string with name of parent type)
            parent: undefined

            // Init function, #this is the new object
            constructor: function(name){

                var nameParts = name.split(' ');
                this.firstname = nameParts[0];
                this.lastname  = nameParts[1];

            },

            // prototype object
            prototype: {
                firstname:      '',
                lastname:       '',
                profession:     '',
                birthday:       0,
                setBirthday:    function(aString){
                                    this.birthday = (new Date(aString)).getTime()
                                }
                getAge:         function(){
                                    return (Date.now() - this.birthday) / 1000 / 60 / 60 / 24 / 365.24 + ' years'
                                }
            }

        }
    }






);


var person1 = FrameTrail.newObject('Person', 'Bob Burglar');

person1.firstname // returns 'Bob'
person1.setBirthday('6/22/1984');
person1.getAge(); // returns "30.79790195218542 years"





// Other example with native getters and setters in object literal.

FrameTrail.defineType(

    'Person',

    function (FrameTrail) {
        return {
            prototype: {
                firstname:  '',
                lastname:   '',

                _birthday:  0,

                get age()   {
                                return (Date.now() - this._birthday) / 1000 / 60 / 60 / 24 / 365.24 + ' years'
                            },


                get birthday()  {

                                    return new Date(this._birthday)

                                },

                set birthday(input) {

                                        this._birthday = (new Date(input)).getTime();

                                    }

            }

        }
    }

);


var person2 = FrameTrail.newObject('Person');

person2.birthday = "6/22/1984"
person2.age // returns "30.79790195218542 years"
