

<template>
    <div class="UnmixedText">
        <p :style="styleExport">{{ component.content }}</p>
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
