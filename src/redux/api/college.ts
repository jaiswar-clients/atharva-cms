import { HTTP } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IResponse } from "./auth";
import { RootState } from "../store";
import { ICollegeFormInputs } from "@/components/College/CollegeDetail";
import { ITabFormInputs } from "@/components/College/CollegeTabs";
import { ISectionFormInput } from "@/components/College/TabSections";
import { NoticeFormInputs } from "@/components/Notice/NoticeDetail";

export interface ICollege {
  _id: string;
  name: string;
  description: string;
  logo: string;
  banner_image: string;
  carousel_images: string[];
  notices: string[];
  results: string[];
  tabs: string[];
  payment_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITab<T = string> {
  _id: string;
  name: string;
  key: string;
  description?: string;
  sections: T[];
  is_courses?: boolean;
  courses?: string[];
}

export interface IDynamicVariable {
  _id: string;
  key: string;
  type: string;
  media_id: string;
}

export interface ITable {
  _id: string;
  headers: string[];
  data: string[][];
  styles?: {
    container_style?: any;
    table_style?: any;
    header_style?: any;
    header_text_style?: any;
    row_style?: any;
    row_text_style?: any;
  };
  column_widths?: number[];
}

export interface ISection<T = ITable, D = IDynamicVariable> {
  _id: string;
  name: string;
  has_media: {
    carousel?: boolean;
    image?: boolean;
    video?: boolean;
    pdf?: boolean;
    people_card?: boolean;
    table?: boolean;
  };
  tables?: T[];
  content: string;
  hide_heading?: boolean;
  peoples_card?: {
    name: string;
    designation: string;
    image: string;
    description: string;
  }[];
  images: {
    url: string;
    description: string;
  }[];
  pdfs?: {
    name: string;
    url: string;
    description: string;
  }[];
  videos?: {
    url: string;
    description: string;
  }[];
  media_position: {
    image?: string;
    carousel?: string;
    pdf?: string;
    table?: string;
    people_card?: string;
    video?: string;
  };
  dynamic_variables?: D[];
}

export interface INotice {
  _id: string;
  title: string;
  description: string;
  date: Date;
  attachments: Array<{ id: number; name: string; url: string }>;
  link: string;
  college: string;
}

export interface IFestival {
  _id: string;
  name: string;
  description: string;
  content: string;
  banner_image: string;
  images: string[];
  college_id: string;
  date: string;
  time: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFestivalDto {
  name: string;
  description: string;
  content?: string;
  banner_image?: string;
  images?: string[];
  college_id: string;
  date: string;
  time: string;
}

export interface UpdateFestivalDto extends Partial<CreateFestivalDto> {}

export const collegeApi = createApi({
  reducerPath: "college",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/cms/colleges`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).app.user?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Colleges",
    "Tabs",
    "Sections",
    "SINGLE_COLLEGE",
    "Notices",
    "SINGLE_NOTICE",
    "Festivals",
    "SINGLE_FESTIVAL",
  ],
  endpoints: (builder) => ({
    getColleges: builder.query<IResponse<ICollege[]>, void>({
      query: () => ({
        url: "",
        method: HTTP.GET,
      }),
      providesTags: ["Colleges"],
    }),
    getCollegeById: builder.query<IResponse<ICollege>, string>({
      query: (collegeId) => ({
        url: `/${collegeId}`,
        method: HTTP.GET,
      }),
      providesTags: ["SINGLE_COLLEGE"],
    }),
    getTabsByCollegeId: builder.query<IResponse<ITab[]>, string>({
      query: (collegeId) => ({
        url: `/${collegeId}/tabs`,
        method: HTTP.GET,
      }),
      providesTags: ["Tabs"],
    }),
    getTabById: builder.query<
      IResponse<ITab>,
      { collegeId: string; tabId: string }
    >({
      query: ({ collegeId, tabId }) => ({
        url: `/${collegeId}/tabs/${tabId}`,
        method: HTTP.GET,
      }),
      providesTags: ["Tabs"],
    }),
    getSectionsByTabId: builder.query<IResponse<ISection[]>, string>({
      query: (tabId) => ({
        url: `/tabs/${tabId}/sections`,
        method: HTTP.GET,
      }),
      providesTags: ["Sections"],
    }),
    getSectionById: builder.query<
      IResponse<ISection>,
      { collegeId: string; tabId: string; sectionId: string }
    >({
      query: ({ collegeId, tabId, sectionId }) => ({
        url: `/${collegeId}/tabs/${tabId}/sections/${sectionId}`,
        method: HTTP.GET,
      }),
      providesTags: ["Sections"],
    }),
    getNotices: builder.query<
      IResponse<(INotice & { college: ICollege })[]>,
      void
    >({
      query: () => ({
        url: "/notices",
        method: HTTP.GET,
      }),
      providesTags: ["Notices"],
    }),
    uploadFile: builder.mutation<IResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/upload`,
          method: HTTP.POST,
          body: formData,
        };
      },
    }),
    uploadFiles: builder.mutation<IResponse, File[]>({
      query: (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        return {
          url: `/upload-multiple`,
          method: HTTP.POST,
          body: formData,
        };
      },
    }),
    updateCollegeById: builder.mutation<
      IResponse,
      {
        data: Omit<ICollegeFormInputs, "carousel_images"> & {
          carousel_images: string[];
        };
        id: string;
      }
    >({
      query: ({ data, id }) => ({
        url: `/${id}`,
        method: HTTP.PATCH,
        body: data,
      }),
      invalidatesTags: ["SINGLE_COLLEGE"],
    }),
    addTabToCollege: builder.mutation<
      IResponse,
      { data: ITabFormInputs; id: string }
    >({
      query: ({ data, id: collegeId }) => ({
        url: `/${collegeId}/tabs`,
        method: HTTP.POST,
        body: data,
      }),
      invalidatesTags: ["Tabs"],
    }),
    updateTabById: builder.mutation<
      IResponse,
      { data: ITabFormInputs; id: string }
    >({
      query: ({ data, id }) => ({
        url: `/tabs/${id}`,
        method: HTTP.PATCH,
        body: data,
      }),
      invalidatesTags: ["Tabs"],
    }),
    deleteTabById: builder.mutation<
      IResponse,
      { collegeId: string; tabId: string }
    >({
      query: ({ collegeId, tabId }) => ({
        url: `/${collegeId}/tabs/${tabId}`,
        method: HTTP.DELETE,
      }),
      invalidatesTags: ["Tabs", "SINGLE_COLLEGE", "Colleges"],
    }),
    getSignedUrl: builder.mutation<IResponse, string>({
      query: (fileKey) => ({
        url: `/signed-url`,
        method: HTTP.POST,
        body: { fileName: fileKey },
      }),
    }),
    updateSectionById: builder.mutation<
      IResponse,
      { data: ISectionFormInput; sectionId: string; collegeId: string }
    >({
      query: ({ data, sectionId, collegeId }) => ({
        url: `${collegeId}/sections/${sectionId}`,
        method: HTTP.PATCH,
        body: data,
      }),
      invalidatesTags: ["Sections"],
    }),
    addSectionToTab: builder.mutation<
      IResponse,
      {
        data: Pick<ISectionFormInput, "name">;
        tabId: string;
        collegeId: string;
      }
    >({
      query: ({ data, tabId, collegeId }) => ({
        url: `${collegeId}/tabs/${tabId}/sections`,
        method: HTTP.POST,
        body: data,
      }),
      invalidatesTags: ["Sections"],
    }),
    deleteSectionById: builder.mutation<
      IResponse,
      { collegeId: string; tabId: string; sectionId: string }
    >({
      query: ({ collegeId, tabId, sectionId }) => ({
        url: `${collegeId}/tabs/${tabId}/sections/${sectionId}`,
        method: HTTP.DELETE,
      }),
      invalidatesTags: ["Sections"],
    }),
    addNotice: builder.mutation<IResponse<INotice>, NoticeFormInputs>({
      query: (data) => ({
        url: "/notices",
        method: HTTP.POST,
        body: data,
      }),
      invalidatesTags: ["Notices", "SINGLE_NOTICE"],
    }),
    updateNoticeById: builder.mutation<
      IResponse<INotice>,
      { data: NoticeFormInputs; id: string }
    >({
      query: ({ data, id }) => ({
        url: `/notices/${id}`,
        method: HTTP.PATCH,
        body: data,
      }),
      invalidatesTags: ["Notices", "SINGLE_NOTICE"],
    }),
    deleteNoticeById: builder.mutation<IResponse, string>({
      query: (id) => ({
        url: `/notices/${id}`,
        method: HTTP.DELETE,
      }),
      invalidatesTags: ["Notices", "SINGLE_NOTICE"],
    }),
    getFestivals: builder.query<IResponse<IFestival[]>, void>({
      query: () => ({
        url: "/festivals",
        method: HTTP.GET,
      }),
      providesTags: ["Festivals"],
    }),
    getFestivalById: builder.query<IResponse<IFestival>, string>({
      query: (id) => ({
        url: `/festivals/${id}`,
        method: HTTP.GET,
      }),
      providesTags: ["SINGLE_FESTIVAL"],
    }),
    createFestival: builder.mutation<IResponse<IFestival>, CreateFestivalDto>({
      query: (data) => ({
        url: "/festivals",
        method: HTTP.POST,
        body: data,
      }),
      invalidatesTags: ["Festivals", "SINGLE_COLLEGE"],
    }),
    updateFestival: builder.mutation<
      IResponse<IFestival>,
      { id: string; data: UpdateFestivalDto }
    >({
      query: ({ id, data }) => ({
        url: `/festivals/${id}`,
        method: HTTP.PATCH,
        body: data,
      }),
      invalidatesTags: ["Festivals", "SINGLE_FESTIVAL", "SINGLE_COLLEGE"],
    }),
    deleteFestival: builder.mutation<IResponse, string>({
      query: (id) => ({
        url: `/festivals/${id}`,
        method: HTTP.DELETE,
      }),
      invalidatesTags: ["Festivals", "SINGLE_FESTIVAL", "SINGLE_COLLEGE"],
    }),
  }),
});

export const {
  useGetCollegesQuery,
  useGetCollegeByIdQuery,
  useGetTabsByCollegeIdQuery,
  useGetTabByIdQuery,
  useGetSectionByIdQuery,
  useUploadFileMutation,
  useUploadFilesMutation,
  useUpdateCollegeByIdMutation,
  useUpdateTabByIdMutation,
  useAddTabToCollegeMutation,
  useDeleteTabByIdMutation,
  useGetSectionsByTabIdQuery,
  useGetSignedUrlMutation,
  useUpdateSectionByIdMutation,
  useAddSectionToTabMutation,
  useDeleteSectionByIdMutation,
  useGetNoticesQuery,
  useAddNoticeMutation,
  useUpdateNoticeByIdMutation,
  useDeleteNoticeByIdMutation,
  useGetFestivalsQuery,
  useGetFestivalByIdQuery,
  useCreateFestivalMutation,
  useUpdateFestivalMutation,
  useDeleteFestivalMutation,
} = collegeApi;
