<template>
    <div class="StaticHeader">
        <h1 :style="styleExport">{{ component.title }}</h1>
        <p>{{ component.comment }}</p>
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
