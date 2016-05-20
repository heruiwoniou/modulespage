export const template =
	`<div :class="['full-screen-modal',show?'show':'']">
		<div class="modal-frame">
			<div class="modal-menu">
				<div class="back" @click="close"><i></i></div>
				<a v-if="viewsrc !== 'about:blank' && isview" href="javascript:;" :class="{'view':true,'select':isview }"><i></i><b>概览</b></a>
				<a v-if="viewsrc !== 'about:blank' && !isview" @click="seturl(true,$event)" href="javascript:;" :class="{'view':true,'select':isview }"><i></i><b>概览</b></a>
				<a v-if="analyzesrc !== 'about:blank' && isview" @click="seturl(false,$event)" href="javascript:;" :class="{'analyze':true,'select':!isview}"><i></i><b>分析</b></a>
				<a v-if="analyzesrc !== 'about:blank' && !isview" href="javascript:;" :class="{'analyze':true,'select':!isview}"><i></i><b>分析</b></a>
			</div>
			<div class="modal-right-frame">
				<div class="modal-body">
					<div class="modal-head">中学生上网情况问卷调查</div>
					<div class="modal-content">
						<iframe :src="show?geturl():'about:blank'" frameborder="0" height="100%" width="100%"></iframe>
					</div>
				</div>
			</div>
		</div>
	</div>`