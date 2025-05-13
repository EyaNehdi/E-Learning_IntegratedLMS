import { CheckCircle } from "lucide-react"

const UploadProgress = ({ progress = 0, fileName = "" }) => {
  return (
    <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{progress < 100 ? "Uploading..." : "Upload complete"}</span>
        <span className="font-medium text-gray-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            progress < 100 ? "bg-blue-600" : "bg-green-600"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {progress === 100 && (
        <div className="flex items-center mt-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ready to submit
        </div>
      )}
    </div>
  )
}

export default UploadProgress
