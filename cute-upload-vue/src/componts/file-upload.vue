<script setup lang="ts">
import FileSvg from "/@/componts/svg/file-svg.vue";
import {FileUpload} from "/@/types/file-upload";
import {UploadUtils} from "/@/utils/upload.ts";
import {CloseBold, Delete, RefreshLeft, VideoPause, VideoPlay, ZoomIn} from "@element-plus/icons-vue";
import {ElUpload} from "element-plus";
import type {UploadRequestOptions} from "element-plus/lib/components";
import {computed, onUnmounted, ref, watch} from "vue";

const props = defineProps({
  modelValue: { // 文件路径
    type: String,
    default: ''
  },
  tag: { // 是否显示标签
    type: Boolean,
    default: true
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 100
  },
})
const emit = defineEmits(['update:modelValue'])

const UploadRef = ref<any>(null)
const progress = ref<FileUpload.ProgressOptions>({})
const isPause = ref<boolean>(false)
const isPreview = ref<boolean>(false)

const progressControl: FileUpload.ProgressControl = (change: FileUpload.ProgressOptions) => {
  progress.value = change
}
const updatePath: FileUpload.UpdatePath = (path: string) => {
  emit('update:modelValue', path)
}

const uploadUtils = ref(new UploadUtils(progressControl, updatePath))

const httpRequest = async (options?: UploadRequestOptions) => {
  UploadRef.value?.clearFiles()
  emit('update:modelValue', options?.file.name)
  return await uploadUtils.value.httpRequest(options).then((path: string) => {
    emit('update:modelValue', path)
  })
}

/**
 * 暂停或继续上传
 */
const pauseOrContinue = async () => {
  isPause.value = await uploadUtils.value.pauseOrContinue()
}

/**
 * 取消上传
 */
const cancelUpload = async () => {
  uploadUtils.value.cancel()
}

/**
 * 重新上传
 */
const reUpload = async () => {
  uploadUtils.value.reUpload()
}


const colors = [
  {color: '#f56c6c', percentage: 20},
  {color: '#e6a23c', percentage: 40},
  {color: '#5cb87a', percentage: 60},
  {color: '#1989fa', percentage: 80},
  {color: '#6f7ad3', percentage: 100},
]

/**
 * 获取文件类型
 * @param fileName
 */
const getFileType = (fileName: string) => {
  return fileName && fileName.trim() !== "" ? fileName.slice(fileName.lastIndexOf('.') + 1).toUpperCase() : ""
}

/**
 * 是否是图片
 * @param fileName
 */
const isImage = (fileName: string) => {
  const extension = fileName.slice(fileName.lastIndexOf('.') + 1);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
  return imageExtensions.includes(extension);
}


const optionList = computed(() => {
  return [{
    label: '重新上传',
    icon: RefreshLeft,
    show: progress.value.isUpload,
    click: reUpload
  }, {
    label: '预览',
    icon: ZoomIn,
    show: isImage(props.modelValue),
    click: () => {
      isPreview.value = true
    }
  }, {
    label: '删除',
    icon: Delete,
    show: !!props.modelValue && !progress.value.show,
    click: () => {
      emit('update:modelValue', '')
      uploadUtils.value.progressControl({
        isUpload: false,
        status: null,
        show: false,
        all: 1,
        now: 0,
        tip: '',
      })
    }
  },
    {
      label: '暂停上传',
      icon: isPause.value ? VideoPlay : VideoPause,
      show: progress.value.show,
      click: pauseOrContinue
    },

    {
      label: '取消上传',
      icon: CloseBold,
      show: progress.value.show && progress.value.status !== 'success',
      click: cancelUpload
    }]
})

// 加载的 ...
const loadingPoint = ref<any>({
  count: 0,
  id: null
});
watch(
    () => progress.value.show,
    () => {
      if (progress.value.show) {
        if (!loadingPoint.value.id) {
          loadingPoint.value.id = setInterval(() => {
            loadingPoint.value.count = loadingPoint.value.count + 1;
            if (loadingPoint.value.count >= 4) {
              loadingPoint.value.count = 0;
            }
          }, 500);
        }
      } else {
        clearInterval(loadingPoint.value.id);
        loadingPoint.value.id = null;
      }
    }
);
onUnmounted(() => {
  loadingPoint.value.id ? clearInterval(loadingPoint.value.id) : '';
  loadingPoint.value.id = null;
});
</script>

<template>
  <div class="__upload__main__ items-center justify-center">
    <el-upload ref="UploadRef" drag :show-file-list="false" class="items-center justify-center"
               :before-upload="()=> UploadRef.clearFiles()" :http-request="httpRequest" :limit="1">
      <template #trigger>
        <div class="align-center justify-center" :style="{width: `${width}px`, height: `${height}px`}">
          <div class="__upload__mask__" v-if="progress.isUpload || modelValue || progress.show">
            <div class="__upload__file__" v-if="!progress.show">
              <el-image :style="{width: `${width}px`, height: `${height + 20}px`}"
                        v-if="modelValue && isImage(modelValue)"
                        :src="modelValue"/>
              <el-icon v-else :size="height - 20 <= 0 ? 20 : height" color="whitesmoke">
                <file-svg/>
              </el-icon>
            </div>
            <text class="__upload__mask__file__type__" v-if="tag">
              {{ getFileType(modelValue) }}
            </text>
            <div v-if="modelValue" class="__upload__mask__options__" @click.prevent.stop>
              <template v-for="item in optionList">
                <el-tooltip :effect="'light'" :content="item.label" placement="top" v-if="item.show">
                  <el-icon :size="25" color="white" @click.stop="item.click">
                    <component :is="item.icon"/>
                  </el-icon>
                </el-tooltip>
              </template>
            </div>
            <div class="justify-center items-center __upload__mask__progress__" v-if="progress.show">
              <el-progress :status="progress.status" :percentage="progress.percentage" :color="colors"
                           type="dashboard">
                <template #default="{ percentage }">
                  <div class="column">
                    <span class="__upload__mask__progress__percentage__">{{ percentage }}%</span>
                    <span class="__upload__mask__progress__tip__">
                      {{ progress.tip }}
											<template v-for="item in loadingPoint.count">
												.
											</template></span>
                  </div>
                </template>
              </el-progress>
            </div>
          </div>

          <div v-else>
            <el-icon :size="50" color="gray">
              <Plus/>
            </el-icon>
            <div style="color: gray; margin-top: 10px">
              将文件拖到此处<br/>或<em>点击上传</em>
            </div>
          </div>
        </div>
      </template>
    </el-upload>
    <el-image-viewer @close="isPreview = false" :url-list="[modelValue]"
                     v-if="isPreview && modelValue && isImage(modelValue)"/>
  </div>
</template>

<style scoped>
.__upload__main__ {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 50vh;
  user-select: none;
}

.align-center {
  display: flex;
  align-items: center;
}

.justify-center {
  display: flex;
  justify-content: center;
}

.ml-10 {
  margin-left: 10px;
}

.column {
  display: flex;
  flex-direction: column;
}

.__upload__mask__file__type__ {
  background-color: #67c23a;
  color: #fff;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 12px;
  position: absolute;
  top: 10px;
  left: 10px;
  user-select: none;
}

.__upload__file__ {
  margin-top: 20px;
}

.__upload__mask__:hover .__upload__mask__options__ {
  display: flex;
}

.__upload__mask__options__ {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  flex-direction: row;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.__upload__mask__options__ .el-icon {
  margin: 0 10px;
}

.__upload__mask__progress__ {
  position: absolute;
  top: 40px;
  left: 50px;
  z-index: 99;
}

.__upload__mask__progress__percentage__ {
  margin-bottom: 10px;
}
</style>
