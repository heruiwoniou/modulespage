import { template } from './tpl';

export default {
    template,
    methods:{
    	close(){
            this.xtype=true;
    		this.show=false;
            this.viewsrc="about:blank";
            this.analyzesrc="about:blank";
    	},
        seturl(isview,$event){
            this.isview=isview;
            $($event.currentTarget).closest('.modal-menu').find('a.select').removeClass('select')
            .end().end().addClass('select');
        },
        geturl(){
            return this.isview?this.viewsrc:this.analyzesrc;
        }
    },
    watch:{
    	'show':function(_new_, _old_){
    		if(_new_)
    			$(document.documentElement).addClass('scroll-hide')
    		else
    			$(document.documentElement).removeClass('scroll-hide')
    	}
    },
    data() {
        return {
            isview:true,
            show: false,
            viewsrc:"about:blank",
            analyzesrc:"about:blank"
        }
    }

}
