<template>
	<div class="control-container">
		<control-lib-bar :type="component.type" :majorkey="component.majorkey" :title="component.title"></control-lib-bar>
		<div class="control-content">
			<div class="control-preview MatrixChoiceQuestion">
				<div class='m-c'>
                    <div class="m-top">
                        <table>
                            <tr>
                                <th class="nh">&nbsp;&nbsp;&nbsp;</th>
                                <th class="cell" v-for="index in component.cells.length">
                                    <span>{{component.cells[index]}}</span>
                                </th>
                            </tr>
                            <tr v-for="index in component.rows.length">
                                <th class="row">
                                    <span>{{component.rows[index]}}</span>
                                </th>
                                <td v-for="i in component.cells.length"><input :type="component.single?'radio':'checkbox'"></td>
                            </tr>
                        </table>
                    </div>
                </div>
			</div>
			<p><span>来自</span><b :title="component.from">{{component.from}}</b><i>{{component.used}}次使用</i></p>
		</div>
	</div>
</template>
<script>
	import './common/ControlLibBar'
	export default{
		props:{
			component:{
				type:Object
			}
		}
	}
</script>