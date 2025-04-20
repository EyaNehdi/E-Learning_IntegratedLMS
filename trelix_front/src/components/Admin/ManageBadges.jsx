import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
const baseUrl = "http://localhost:5000";
const ManageBadges = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = location.pathname.includes("/edit/");
  const badgeData = location.state?.badgeData;
  const badgeId = isEditing ? location.pathname.split("/").pop() : null;

  if (isEditing) {
    console.log("when in update", isEditing);
    console.log("when in update", badgeId);
    console.log("when in update", badgeData);
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [customFileName, setCustomFileName] = useState("");

  // Initialize image preview
  useEffect(() => {
    if (isEditing && badgeData?.existingImage) {
      // Check if the image is already a full URL or needs the base URL
      const isFullUrl = badgeData.existingImage.startsWith("http");
      setImagePreview(
        isFullUrl
          ? badgeData.existingImage
          : `${baseUrl}${badgeData.existingImage}`
      );
    }
  }, [isEditing, badgeData]);

  const BadgeSchema = Yup.object().shape({
    name: Yup.string().required("Badge name is required"),
    description: Yup.string(),
    image: Yup.mixed().when([], (image, schema, context) => {
      if (!context?.isEditing) {
        return schema.required("Image is required for new badges");
      }
      return schema.notRequired();
    }),
    customFileName: Yup.string(),
    triggerType: Yup.string()
      .oneOf(
        [
          "certificatesOwned",
          "completedChapters",
          "totalScore",
          "mfaEnabled",
          "role",
        ],
        "Invalid trigger type"
      )
      .required("Trigger type is required"),
    triggerCondition: Yup.string()
      .oneOf([">", "===", "!="], "Invalid trigger condition")
      .required("Trigger condition is required"),
    conditionValue: Yup.mixed().required("Condition value is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");

      if (values.image) {
        if (values.customFileName?.trim()) {
          const originalFile = values.image;
          const fileExtension = originalFile.name.split(".").pop();
          const renamedFile = new File(
            [originalFile],
            `${values.customFileName.trim()}.${fileExtension}`,
            { type: originalFile.type }
          );
          formData.append("image", renamedFile);
        } else {
          formData.append("image", values.image);
        }
      }

      formData.append("triggerType", values.triggerType);
      formData.append("triggerCondition", values.triggerCondition);

      const conditionValue =
        values.triggerType === "role" || values.triggerType === "mfaEnabled"
          ? String(values.conditionValue)
          : values.triggerType === "totalScore"
          ? Number(values.conditionValue)
          : values.conditionValue;

      formData.append("conditionValue", conditionValue);

      if (isEditing) {
        await axios.put(`/api/badges-r/updateBadge/${badgeId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSubmitMessage({
          type: "success",
          text: "Badge updated successfully!",
        });
      } else {
        await axios.post("/api/badges-r/createBadge", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSubmitMessage({
          type: "success",
          text: "Badge created successfully!",
        });
        resetForm();
        setImagePreview(null);
        setCustomFileName("");
      }

      setTimeout(() => navigate("/badge/list-badges"), 1500);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          (isEditing ? "Failed to update badge" : "Failed to create badge"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFieldValue("image", null);
      setImagePreview(
        isEditing && badgeData?.existingImage
          ? `${baseUrl}${badgeData.existingImage}`
          : null
      );
    }
  };

  // Render condition value input based on trigger type
  const renderConditionValueInput = (triggerType) => {
    const radioOptions = {
      mfaEnabled: [
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ],
      role: [
        { value: "student", label: "Student" },
        { value: "instructor", label: "Instructor" },
        { value: "admin", label: "Admin" },
      ],
    };

    if (radioOptions[triggerType]) {
      return (
        <div className="flex gap-4 mt-1">
          {radioOptions[triggerType].map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <Field
                type="radio"
                name="conditionValue"
                value={option.value}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <Field
        type={
          ["certificatesOwned", "completedChapters", "totalScore"].includes(
            triggerType
          )
            ? "number"
            : "text"
        }
        name="conditionValue"
        className="border rounded px-3 py-1.5 w-full text-sm mt-1"
      />
    );
  };

  const triggerTypeOptions = [
    { value: "certificatesOwned", label: "Certificates Owned" },
    { value: "completedChapters", label: "Completed Chapters" },
    { value: "totalScore", label: "Total Score" },
    { value: "mfaEnabled", label: "MFA Enabled" },
    { value: "role", label: "Role" },
  ];

  const triggerConditionOptions = [
    { value: ">", label: "Greater than (>)" },
    { value: "===", label: "Exactly equals (===)" },
    { value: "!=", label: "Not equals (!=)" },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4 text-gray-800">
        {isEditing ? "Edit Badge" : "Create New Badge"}
      </h1>

      {submitMessage.text && (
        <div
          className={`p-2 mb-3 rounded text-sm ${
            submitMessage.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <Formik
        initialValues={{
          name: badgeData?.name || "",
          description: badgeData?.description || "",
          image: badgeData?.existingImage || null,
          customFileName: "",
          triggerType: badgeData?.triggerType || "",
          triggerCondition: badgeData?.triggerCondition || "",
          conditionValue: badgeData?.conditionValue || "",
          existingImage: badgeData?.existingImage || null,
        }}
        validationSchema={BadgeSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validateOnChange={false}
        validateOnBlur={false}
        context={{ isEditing }}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-4">
            {/* Basic Info Section */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Name*
                  </label>
                  <Field
                    type="text"
                    name="name"
                    className="border rounded px-3 py-1.5 w-full text-sm"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows="2"
                    className="border rounded px-3 py-1.5 w-full text-sm"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Badge Image {isEditing && "(Leave empty to keep current image)"}
              </h4>
              <div className="border rounded-md p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isEditing
                            ? "Update Image (Optional)"
                            : "Upload Image*"}
                        </label>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.currentTarget.files[0];
                            setFieldValue("image", file || null); // Explicitly set null if no file
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setImagePreview(reader.result);
                              reader.readAsDataURL(file);
                            } else {
                              setImagePreview(
                                `${baseUrl}${values.existingImage}` || null
                              );
                            }
                          }}
                          className="border rounded px-3 py-1.5 w-full text-sm"
                        />
                        <ErrorMessage
                          name="image"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                        {isEditing && values.existingImage && (
                          <p className="text-xs text-gray-500 mt-1">
                            Current image will be kept if no new image is
                            selected
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom File Name
                      </label>
                      <Field
                        type="text"
                        name="customFileName"
                        placeholder="Custom name (without extension)"
                        className="border rounded px-3 py-1.5 w-full text-sm"
                        onChange={(e) => {
                          setFieldValue("customFileName", e.target.value);
                          setCustomFileName(e.target.value);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Original extension will be preserved
                      </p>
                    </div>
                  </div>

                  {(imagePreview || values.existingImage) && (
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isEditing ? "Current Image" : "Preview"}
                      </label>
                      <div className="border rounded p-1 flex items-center justify-center bg-gray-50 h-full">
                        <img
                          src={
                            imagePreview || `${baseUrl}${values.existingImage}`
                          }
                          alt={isEditing ? "Current badge" : "Badge preview"}
                          className="max-h-28 object-contain"
                          onError={(e) => {
                            e.target.src = "/assets/default-badge.png";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trigger Conditions Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Trigger Conditions
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Type*
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {triggerTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Field
                          type="radio"
                          name="triggerType"
                          value={option.value}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage
                    name="triggerType"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Condition*
                  </label>
                  <div className="flex gap-4">
                    {triggerConditionOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Field
                          type="radio"
                          name="triggerCondition"
                          value={option.value}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage
                    name="triggerCondition"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition Value*
                  </label>
                  {renderConditionValueInput(values.triggerType)}
                  <ErrorMessage
                    name="conditionValue"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Badge"
                  : "Create Badge"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/badge/list-badges")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ManageBadges;
