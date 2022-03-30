// ---−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−
let FieldComponent = {

    template: '#field-template',

    props: {    title: {type: String, required: true},
                text:  {type: String, default: '', required: true}
            },
    watch: {    text: function(){
                    this.revealed = false }
            },
    data(){
        return{
            revealed: false,
            // styleDisabled: ["font-italic bg-warning"]
        }
    }
}

// ---−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−−
Vue.createApp({

    components: {Field: FieldComponent
    },

    data() {
        return {

            display: 0,                     // Display mods to show error / List / history
            currentIndex: 0,                // Index of the current word in 'words' array
            previousCursor: -1,             // Use to navigate in the 'previous' array

            previous: [],                   // Saves all previous word's indexes (allows to come back and invert)
            history: [],                    // Saves all previous but without duplicates nor order

            words: [{   Word:         '',
                        Type:         '',
                        Translation:  '',
                        Synonym:      '',
                        Context:      '',
                        Example:      '',
                        Comment:      ''}]
        }
    },

    watch: {currentIndex: function(i){
                    if (!this.history.includes(i)){
                        this.history.push(i) }
                } 
            },

    methods: {

        isObjectEmpty(someObject){
          return !(Object.keys(someObject).length)
        },

        // One step behind - Move the previousCursor to change the currentIndex
        backward(){
            if(this.previousCursor > 0){
                this.previousCursor -= 1
                this.currentIndex = this.previous[this.previousCursor]
            }
        },

        // One step ahead - Randomises a new word if needed
        //                  or just move the previous cursor
        forward(){

            if(this.previousCursor == this.previous.length - 1){

                // Select a new index and puts it in previous
                while(true){
                    const index = Math.floor(Math.random() * this.words.length)

                    // Checks if already worked
                    if (!this.previous.includes(index) || this.previous.length >= this.words.length){
                        this.previous.push(index)
                        break
                    }
                }
            }

            // Then shifts the cursor and updates the current index
            this.previousCursor += 1
            this.currentIndex = this.previous[this.previousCursor]
        },

        // As words list is already sorted, we just need to sort indexes
        // Method created to not sort for each new word
        sortHistory(){
            this.history.sort(function(a, b) {
              return a - b;
            });
        },

        // Allows to switch between English/French
        // Inverts Word and Translation in the array
        invert(){

            // Saves the current word to find after inversion
            const currentWord = this.words[this.currentIndex].Word

            // Inverts all the words then sorts
            for(let elem of this.words){
                const w = elem.Word
                elem.Word = elem.Translation
                elem.Translation = w
            }

            this.words.sort((a, b)=> a.Word.localeCompare(b.Word))

            // Finds the current, erases history/previous and saves the new index
            for (let i in this.words){

                if (this.words[i].Translation === currentWord){
                    this.history = [i]
                    this.previous = [i]
                    this.currentIndex = i
                    break
                }
            }
        },
    },

    async created() {

        try {
            const response = await fetch('https://raw.githubusercontent.com/FLinguenheld/vocabulary2/main/vocabulary.csv')
            if (!response.ok){
                throw "ヽ(°〇°)ﾉ"
            }

            const r = await response.text()

            this.words = []
            for (const line of r.split('\n')){

                const txt = line.split(',')

                this.words.push({
                    Word:         txt[0],
                    Type:         txt[1],
                    Translation:  txt[2],
                    Synonym:      txt[3],
                    Context:      txt[4],
                    Example:      txt[5],
                    Comment:      txt[6]})
            }

            // Removes titles and the last (empty line)
            this.words.shift()
            this.words.pop()

            // Sorts for the method list and first random
            this.words.sort((a, b)=> a.Word.localeCompare(b.Word))
            this.forward()

        } catch (error)	{
            console.log(error)
            this.display = -1
        }
    }
})

.mount('#app')
