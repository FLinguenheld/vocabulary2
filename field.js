let FieldComponent = {

    template: '#field-template',

    props: {    title: {type: String, required: true},
                text:  {type: String, required: true}
            },
    watch: {    text: function(){
                    this.revealed = false }
            },
    data(){
        return{
            revealed: false,
            styleDisabled: ["font-italic bg-warning"]
        }
    }
}


Vue.createApp({

    components: {Field: FieldComponent},

    data() {
        return {
           
            // words: [{   Word:         '',
            //             Translation:  '',
            //             Synonym:      '',
            //             Context:      '',
            //             Comment:      ''}],
            words: [],
            previous: [],
            history: [],

            currentIndex: 0,
            display: 0
        }
    },

    methods: {

        random(){

            while(true){

                const index = Math.floor(Math.random() * this.words.length -1)

                // Checks if already worked
                if (this.previous.includes(index)){
                    if (this.previous.length >= this.words.length){
                        this.previous = []
                    }
                }else{
                    this.previous.push(index)

                    // Saves history
                    if (!this.history.includes(index)){
                        this.history.push(index)
                    }

                    this.currentIndex = index
                    break
                }
            }
        }

    },

    async created() {

        try {
            const response = await fetch('https://raw.githubusercontent.com/FLinguenheld/vocabulary/main/vocabulary.csv')
            const r = await response.text()

            // this.words = []
            for (const line of r.split('\n')){

                const txt = line.split(',')

                this.words.push({
                    Word:         txt[0],
                    Translation:  txt[1],
                    Synonym:      txt[2],
                    Context:      txt[3],
                    Comment:      txt[4]})
            }

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
