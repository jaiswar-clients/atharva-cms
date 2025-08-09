import React from 'react'
import EditNewsPageClient from './EditNewsPageClient'

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditNewsPageClient id={id} />
}