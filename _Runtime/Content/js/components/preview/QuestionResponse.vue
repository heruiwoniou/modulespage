

<template>
    <div class="QuestionResponse">
        <h1 :style="styleExport"><span class="qindex">Q{{component.qindex}}:</span>{{ component.question }}</h1>
        <div class="response-container">
            <input v-if="component.single" type="text" :name="component.id" v-model="component.value" lazy>
            <textarea v-else cols="30" rows="5" v-model="component.value" lazy></textarea>
        </div>
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
