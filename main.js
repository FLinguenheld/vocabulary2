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

            display: 0,                     // Displays mods to show error / List / history
            currentIndex: 0,                // Index of the current word in 'words' array -> used in html
            historyCursor: -1,              // Uses to navigate in the 'history' array

            history: [],                    // Saves all indexes and respects the order
            words: [{   Word:         '',
                        Type:         '',
                        Translation:  '',
                        Synonym:      '',
                        Context:      '',
                        Example:      '',
                        Comment:      ''}]
        }
    },

    // Updates history on each new currentIndex
    watch: {currentIndex: function(i){

                    // Removes if already saved to avoid repetitions
                    if (this.history.includes(i)){
                        this.history.splice(this.history.indexOf(i), 1)
                    }

                    this.history.splice(this.historyCursor, 0, i)
                }
            },

    methods: {

        // One step behind - Move the historyCursor in history and Updates currentIndex
        backward(){
            if(this.historyCursor > 0){
                this.historyCursor -= 1
                this.currentIndex = this.history[this.historyCursor]
            }
        },

        // One step ahead - Moves the history cursor
        //                  Randomises a new word if needed
        forward(){

            this.historyCursor += 1

            if(this.historyCursor == this.history.length){

                // Finds a new index
                while(true){
                    const index = Math.floor(Math.random() * this.words.length)

                    // Checks if already worked (history's update done in 'watch')
                    if (!this.history.includes(index) || this.history.length >= this.words.length){
                        this.currentIndex = index
                        break
                    }
                }
            } else{
                this.currentIndex = this.history[this.historyCursor]
            }
        },

        // Creates a temporary array to build and sort history
        sortedHistory(){

            let tempHistory = [...this.history]
            tempHistory.sort((a, b)=> this.words[a].Word.localeCompare(this.words[b].Word))

            return tempHistory
        },

        // Allows to switch between English/French
        // Inverts Word and Translation in words' array
        // Converts history and the current index
        invert(){

            // Inverts all words
            for(let elem of this.words){
                const w = elem.Word
                elem.Word = elem.Translation
                elem.Translation = w
            }

            // Temp
            const tempWords = [...this.words]
            const tempHistory = [...this.history]

            // Sorts by word and clears history
            this.words.sort((a, b)=> a.Word.localeCompare(b.Word))
            this.history = []

            // Converts history to new words
            for (const oldIndex of tempHistory){
                this.history.push(this.words.indexOf(tempWords[oldIndex]))
            }

            // Replaces the current index
            this.currentIndex = this.history[this.historyCursor]
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
                    Comment:      txt[5],
                    Example:      txt.slice(6, txt.length).join(',')})
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
