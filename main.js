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

            display: 0,
            currentIndex: 0,

            previous: [],
            history: [],
            words: [{   Word:         '',
                        Type:         '',
                        Translation:  '',
                        Synonym:      '',
                        Context:      '',
                        Comment:      ''}]
        }
    },

    watch: {currentIndex: function(i){
                    if (!this.history.includes(i)){
                        this.history.push(i) }
                } 
            },

    methods: {

        // As words list is already sorted, we just need to sort indexes
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

        // Sets a new current index
        random(){

            while(true){
                const index = Math.floor(Math.random() * this.words.length)

                // Checks if already worked
                if (this.previous.includes(index)){
                    if (this.previous.length >= this.words.length){
                        this.previous = []
                    }
                }else{
                    this.previous.push(index)
                    this.currentIndex = index
                    break
                }
            }
        }
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
                    Comment:      txt[5]})
            }

            // Removes titles and the last (empty line)
            this.words.shift()
            this.words.pop()

            // Sorts for the method list and first random
            this.words.sort((a, b)=> a.Word.localeCompare(b.Word))
            this.random()

        } catch (error)	{
            console.log(error)
            this.display = -1
        }
    }
})

.mount('#app')
