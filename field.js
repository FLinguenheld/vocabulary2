

let FieldComponent = {

    template: '#field-template',

    props: {    title: {type: String, required: true},
                text: {type: String, required: true}
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

            fields: [['Translation',    ''],
                     ['Synonym',        ''],
                     ['Context',        ''],
                     ['Comment',        '']],

            currentWord: '',
            words: [],
            previous: [],
            history: []
        }
    },
    methods: {
        random(){

            while(true){

                const i = Math.floor(Math.random() * this.words.length)

                // Checks if already worked
                if (this.previous.includes(i)){
                    if (this.previous.length >= this.words.length){
                        this.previous = []
                    }
                }else{
                    this.previous.push(i)

                    // Saves history
                    if (!this.history.includes(this.words[i])){
                        this.history.push(this.words[i])
                    }

                    // Affects
                    this.currentWord = this.words[i][0]

                    for (let j=0; j < this.fields.length; j++){
                        this.fields[j][1] = this.words[i][j+1]
                    }

                    break
                }
            }
        }

    },
    created() {

        fetch('https://raw.githubusercontent.com/FLinguenheld/vocabulary/main/vocabulary.csv')
        .then((response) => response.text())
        .then((txt) => {

                const lines = txt.split('\n')

                for (let i = 1; i < lines.length -1; i++) {
                    this.words[i-1] = lines[i].split(',')
                }

                // Sorts for easy list
                this.words.sort((a, b)=> a[0].localeCompare(b[0]))

                // Set the first word
                this.random()
            })
        .catch((error) =>{
            console.log(error)
            this.currentWord = "Impossible d'accéder aux données"
        })
    }
})

.mount('#app')
