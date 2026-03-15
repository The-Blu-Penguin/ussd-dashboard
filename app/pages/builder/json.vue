<script setup>
import { ref } from 'vue'
import { Save, Code, FileJson } from 'lucide-vue-next'

const jsonContent = ref(JSON.stringify({
  "menuConfig": {
    "configId": "config_v1",
    "version": 1,
    "metadata": {
      "name": "MENU CONFIG",
      "description": "BLU PAY USSD MENU FLOW",
      "merchantCode": "BLUPAY1000"
    },
    "entry": "enter_amount",
    "steps": [
      {
        "id": "enter_amount",
        "type": "INPUT",
        "prompt": "Welcome to {{merchantName}}\\nEnter amount:",
        "input": {
          "variable": "amount",
          "validation": {
            "type": "AMOUNT",
            "minValue": 0.01,
            "errorMessage": "Invalid amount. Enter numbers only"
          }
        },
        "next": "process_payment"
      },
      {
        "id": "enter_description",
        "type": "INPUT",
        "prompt": "Enter reference:",
        "input": {
          "variable": "description",
          "validation": {
            "type": "ALPHANUMERIC"
          }
        },
        "next": "process_payment"
      },
      {
        "id": "process_payment",
        "type": "ACTION",
        "actionName": "processPaymentToMerchant",
        "onSuccess": "payment_success",
        "onFailure": "payment_failed"
      },
      {
        "id": "payment_success",
        "type": "END",
        "prompt": "Request submitted successfully. You will receive a payment prompt shortly. If prompt delays, dial *170# to approve transaction. Ref: {{transactionReference}}."
      },
      {
        "id": "payment_failed",
        "type": "END",
        "prompt": "Transfer failed. Please try again later."
      }
    ]
  }
}, null, 2))
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">JSON Builder</h1>
        <p class="text-sm text-gray-500">Edit USSD flow configuration directly</p>
      </div>
      <div class="flex space-x-3">
        <button class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
          <FileJson class="w-4 h-4" />
          <span>Format</span>
        </button>
        <button class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Save class="w-4 h-4" />
          <span>Save Config</span>
        </button>
      </div>
    </div>

    <!-- Editor -->
    <div class="flex-1 bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden flex flex-col">
      <div class="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span class="text-xs font-mono text-gray-400">config.json</span>
        <div class="flex items-center space-x-2">
           <span class="w-3 h-3 rounded-full bg-red-500"></span>
           <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
           <span class="w-3 h-3 rounded-full bg-green-500"></span>
        </div>
      </div>
      <textarea 
        v-model="jsonContent" 
        class="flex-1 w-full bg-gray-900 text-green-400 font-mono p-4 text-sm focus:outline-none resize-none"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>