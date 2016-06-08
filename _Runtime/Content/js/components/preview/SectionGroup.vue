

<template>
    <div class="SectionGroup">
        <h1 :style="styleExport">{{ component.title }}</h1>
        <component v-for="item in component.children" v-if="item!=null" :is="item.type" :component="item" :index="$index" :paths="prefixpath" :preview='preview'></component>
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
