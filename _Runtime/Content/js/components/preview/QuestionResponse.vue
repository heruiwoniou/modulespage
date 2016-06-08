

<template>
    <div class="QuestionResponse">
         <h1 :style="styleExport">{{ component.question }}</h1>
         <input v-if="component.single" type="text" :name="component.id" :value="component.answer">
         <textarea v-else cols="30" rows="5" @focusout="closeanswer">{{component.answer}}</textarea>
    </div>
</template>

<script>
    import props from './../common/props';
    import { styleExport } from './../common/computed';
    export default {
        props: props,
        computed: {
            styleExport
        }
    }

</script>
