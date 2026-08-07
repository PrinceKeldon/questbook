import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { QuestionnaireResponse, SkillsCanvas } from '@/types'

interface PDFGeneratorOptions {
  questionnaire: QuestionnaireResponse
  userName: string
}

export async function generatePersonalizedPDF({
  questionnaire,
  userName,
}: PDFGeneratorOptions): Promise<void> {
  try {
    // Create a temporary container for the PDF content
    const container = document.createElement('div')
    container.id = 'pdf-container'
    container.style.width = '210mm' // A4 width
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.backgroundColor = '#EDE7D9' // paper color

    // Add the PDF content
    container.innerHTML = generatePDFHTML(questionnaire, userName)
    document.body.appendChild(container)

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#EDE7D9',
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgData = canvas.toDataURL('image/png')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * pageWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add image in pages
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download
    const fileName = `Architecture_of_You_${userName}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    // Cleanup
    document.body.removeChild(container)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

function generatePDFHTML(
  questionnaire: QuestionnaireResponse,
  userName: string
): string {
  const canvas = questionnaire.skills_canvas
  const dateFormatted = new Date(questionnaire.created_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
    <div style="font-family: Arial, sans-serif; color: #202C39; line-height: 1.6; padding: 40px;">
      
      <!-- Title Page -->
      <div style="text-align: center; margin-bottom: 60px; padding: 40px 0;">
        <p style="font-size: 12px; letter-spacing: 2px; color: #B5670E; margin-bottom: 20px; text-transform: uppercase;">Field Manual No. 01</p>
        <h1 style="font-size: 48px; margin: 20px 0; color: #202C39; font-weight: normal;">The Architecture of You</h1>
        <p style="font-size: 14px; color: #4A5568; max-width: 500px; margin: 0 auto;">Discover your hidden operating system through evidence-based questioning.</p>
        <p style="font-size: 12px; color: #4A5568; margin-top: 30px;">Version ${questionnaire.version} — ${dateFormatted}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #C7BFA9; margin: 40px 0;" />

      <!-- Your Results -->
      <div style="margin: 60px 0;">
        <p style="font-size: 12px; letter-spacing: 2px; color: #B5670E; margin-bottom: 10px; text-transform: uppercase;">Your Results</p>
        <h2 style="font-size: 36px; margin: 0 0 40px 0; font-weight: normal;">You've Found Your Architecture</h2>

        ${
          canvas
            ? `
          <!-- Skills Canvas -->
          <div style="margin: 40px 0;">
            <h3 style="font-size: 18px; margin-bottom: 20px;">The Skills Canvas</h3>
            
            <div style="display: flex; gap: 20px; margin-bottom: 40px;">
              <!-- Innate Strength -->
              <div style="flex: 1; border: 1px solid #C7BFA9; padding: 20px;">
                <p style="font-size: 11px; letter-spacing: 1px; color: #1F5F5B; text-transform: uppercase; margin-bottom: 8px;">01 Innate Strength</p>
                <h4 style="font-size: 16px; margin: 0 0 10px 0; color: #202C39;">${canvas.innate_strength.name}</h4>
                <p style="font-size: 12px; color: #4A5568; margin-bottom: 15px;">${canvas.innate_strength.description}</p>
                <div style="display: flex; gap: 10px; font-size: 12px;">
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">NATURAL</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.innate_strength.natural}/5</p>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">PRACTICAL</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.innate_strength.practical}/5</p>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">MEASURABLE</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.innate_strength.measurable}/5</p>
                  </div>
                </div>
              </div>

              <!-- Marketable Skill -->
              <div style="flex: 1; border: 1px solid #C7BFA9; padding: 20px;">
                <p style="font-size: 11px; letter-spacing: 1px; color: #1F5F5B; text-transform: uppercase; margin-bottom: 8px;">02 Marketable Skill</p>
                <h4 style="font-size: 16px; margin: 0 0 10px 0; color: #202C39;">${canvas.marketable_skill.name}</h4>
                <p style="font-size: 12px; color: #4A5568; margin-bottom: 15px;">${canvas.marketable_skill.description}</p>
                <div style="display: flex; gap: 10px; font-size: 12px;">
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">NATURAL</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.marketable_skill.natural}/5</p>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">PRACTICAL</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.marketable_skill.practical}/5</p>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">MEASURABLE</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.marketable_skill.measurable}/5</p>
                  </div>
                </div>
              </div>

              <!-- Unique Positioning -->
              <div style="flex: 1; border: 1px solid #C7BFA9; padding: 20px;">
                <p style="font-size: 11px; letter-spacing: 1px; color: #1F5F5B; text-transform: uppercase; margin-bottom: 8px;">03 Unique Positioning</p>
                <h4 style="font-size: 16px; margin: 0 0 10px 0; color: #202C39;">${canvas.unique_positioning.name}</h4>
                <p style="font-size: 12px; color: #4A5568; margin-bottom: 15px;">${canvas.unique_positioning.description}</p>
                <div style="display: flex; gap: 10px; font-size: 12px;">
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">NATURAL</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.unique_positioning.natural}/5</p>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">PRACTICAL</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.unique_positioning.practical}/5</p>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 10px;">MEASURABLE</p>
                    <p style="margin: 0; font-size: 18px; color: #B5670E; font-weight: bold;">${canvas.unique_positioning.measurable}/5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
            : '<p style="color: #4A5568;">Results processing... Please refresh the page.</p>'
        }
      </div>

      <!-- Footer -->
      <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid #C7BFA9; text-align: center; font-size: 11px; color: #4A5568;">
        <p>The Architecture of You Field Manual</p>
        <p>For personal use. This document is unique to you.</p>
      </div>

    </div>
  `
}
