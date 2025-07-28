# from reportlab.lib.pagesizes import letter, A4
# from reportlab.lib import colors
# from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
# from reportlab.lib.units import inch
# from reportlab.pdfbase import pdfmetrics
# from reportlab.pdfbase.ttfonts import TTFont
# from reportlab.lib.colors import black
# import re


# # Register the fonts
# pdfmetrics.registerFont(TTFont('CMU-Regular', 'fonts/cmunrm.ttf'))
# pdfmetrics.registerFont(TTFont('CMU-Bold', 'fonts/cmunbx.ttf'))
# pdfmetrics.registerFont(TTFont('CMU-Italic', 'fonts/cmunti.ttf'))
# pdfmetrics.registerFont(TTFont('CMU-BoldItalic', 'fonts/cmunbi.ttf'))



# def remove_asterisk_bold(text):    
#     # Remove bold formatting like **word**
#     text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
#     # Remove leading ## (and any extra spaces)
#     text = re.sub(r'^##\s*', '', text, flags=re.MULTILINE)
#     # Remove leading # (and any extra spaces)
#     text = re.sub(r'^#\s*', '', text, flags=re.MULTILINE)
#     # Remove leading --- (and any extra spaces)
#     text = re.sub(r'^---\s*', '', text, flags=re.MULTILINE)

#     return text

# def convert_text_to_pdf(text, output_filename="generated\\Tarek Ashraf.pdf"):
#     """Convert plain text CV to a formatted PDF file."""
#     # Create a PDF document
#     doc = SimpleDocTemplate(
#         output_filename,
#         pagesize=A4,
#         leftMargin=30,
#         rightMargin=40,
#         topMargin=30,
#         bottomMargin=28,
#         )
#     styles = getSampleStyleSheet()
    
#     # Create custom styles
#     # styles.add(ParagraphStyle(
#     #     name='Heading1',
#     #     parent=styles['Heading1'],
#     #     fontSize=16,
#     #     spaceAfter=12,
#     #     textColor=colors.darkblue
#     # ))
#     heading1_style = styles['Heading1']
#     heading1_style.fontSize = 16
#     heading1_style.spaceAfter = 12
#     heading1_style.textColor = colors.black
#     heading1_style.fontName = 'CMU-Bold'
    
#     # styles.add(ParagraphStyle(
#     #     name='Heading2',
#     #     parent=styles['Heading2'],
#     #     fontSize=14,
#     #     spaceAfter=8,
#     #     textColor=colors.darkblue
#     # ))
#     heading2_style = styles['Heading2']
#     heading2_style.fontSize = 14
#     heading2_style.spaceAfter = 8
#     heading2_style.textColor = colors.black
    
#     # styles.add(ParagraphStyle(
#     #     name='Normal',
#     #     parent=styles['Normal'],
#     #     fontSize=11,
#     #     spaceAfter=6
#     # ))
#     normal_style = styles['Normal']
#     normal_style.fontSize = 9
#     normal_style.spaceAfter = 5
#     heading2_style.textColor = colors.black

#     # Parse the text and create PDF elements
#     elements = []
    
    # # Remove asterisks from the text
    # text = remove_asterisk_bold(text)

#     # Split the text into sections
#     sections = text.split('\n\n')
    
#     for section in sections:
#         if not section.strip():
#             continue
            
#         lines = section.split('\n')

#         # print(f"\n\nlines: {lines}\n\n")
        
#         # Check if this is a header section
#         if len(lines) == 1 and lines[0].isupper():
#             # This is a main section header
#             elements.append(Paragraph(lines[0], heading1_style))
#             elements.append(HRFlowable(width="100%", thickness=0.5, color=black, spaceBefore=0, spaceAfter=6))
#             elements.append(Spacer(1, 0.1 * inch))
#         elif len(lines) == 1 and any(char.isupper() for char in lines[0]):
#             # This might be a subsection header
#             elements.append(Paragraph(lines[0], heading2_style))
#             elements.append(Spacer(1, 0.05 * inch))
#         else:
#             # Process the first line as a potential subsection header
#             if lines and any(char.isupper() for char in lines[0]) and len(lines[0].split()) <= 5:
#                 elements.append(Paragraph(lines[0], heading2_style))
#                 elements.append(Spacer(1, 0.05 * inch))
#                 lines = lines[1:]
            
#             # Process remaining lines as normal text
#             for line in lines:
#                 if line.strip():
#                     # Check if this is a bullet point
#                     if line.strip().startswith('•') or line.strip().startswith('-'):
#                         elements.append(Paragraph(f"<bullet>&bull;</bullet> {line.strip()[1:].strip()}", normal_style))
#                     else:
#                         elements.append(Paragraph(line, normal_style))
        
#         elements.append(Spacer(1, 0.1 * inch))
    
#     # Build the PDF
#     doc.build(elements)
    
#     return output_filename


from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
import re


def remove_asterisk_bold(text):    
    # Remove bold formatting like **word**
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    # Remove leading ## (and any extra spaces)
    text = re.sub(r'^##\s*', '', text, flags=re.MULTILINE)
    # Remove leading # (and any extra spaces)
    text = re.sub(r'^#\s*', '', text, flags=re.MULTILINE)
    # Remove leading --- (and any extra spaces)
    text = re.sub(r'^---\s*', '', text, flags=re.MULTILINE)

    return text

def convert_text_to_pdf(text, output_filename="Tarek Ashraf.pdf"):
    """Convert plain text CV to a formatted PDF file."""
    # Create a PDF document
    doc = SimpleDocTemplate(output_filename, pagesize=letter, 
                           leftMargin=0.5*inch, rightMargin=0.5*inch,
                           topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Register fonts (using default fonts that are similar to the template)
    styles = getSampleStyleSheet()
    
    # Create custom styles to match the template
    styles.add(ParagraphStyle(
        name='Name',
        parent=styles['Heading1'],
        fontSize=14,
        fontName='Times-Bold',
        spaceAfter=6,
    ))
    
    styles.add(ParagraphStyle(
        name='ContactInfo',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Times-Roman',
        spaceAfter=2,
    ))
    
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading2'],
        fontSize=11,
        fontName='Times-Bold',
        textTransform='uppercase',
        spaceBefore=12,
        spaceAfter=6,
        underline=True,
    ))
    
    styles.add(ParagraphStyle(
        name='JobTitle',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Times-Bold',
        spaceBefore=6,
        spaceAfter=1,
    ))
    
    styles.add(ParagraphStyle(
        name='JobDetails',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Times-Italic',
        spaceAfter=4,
    ))
    
    styles.add(ParagraphStyle(
        name='BulletPoint',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Times-Roman',
        leftIndent=18,
        firstLineIndent=-18,
        spaceAfter=3,
    ))
    
    styles.add(ParagraphStyle(
        name='CustomNormal',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Times-Roman',
        spaceAfter=3,
    ))
    
    # Parse the text and create PDF elements
    elements = []
    
    # Extract sections from the text
    sections = {}
    current_section = None
    current_content = []

    # Remove asterisks from the text
    text = remove_asterisk_bold(text)
    
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        
        # Check if this is a section header (all caps or specific keywords)
        if line.isupper() or line in ["Experience", "Projects", "Education", "Skills", 
                                     "Certifications", "Publications", 
                                     "Open-Source Contribution", "Extracurricular Activities",
                                     "Research Experience"]:
            if current_section:
                sections[current_section] = current_content
            current_section = line
            current_content = []
        else:
            current_content.append(line)
    
    # Add the last section
    if current_section:
        sections[current_section] = current_content
    
    # Extract personal info (assuming it's at the beginning before any section)
    personal_info = []
    if 'Experience' in sections:
        idx = lines.index('Experience')
        personal_info = lines[:idx]
    
    # # Create the header with name and contact info
    # if personal_info:
    #     # Name
    #     name = personal_info[0] if personal_info else "Tarek Ashraf"
    #     elements.append(Paragraph(name, styles['Name']))
        
    #     # Contact info - create a two-column layout
    #     contact_data = []
    #     left_contacts = []
    #     right_contacts = []
        
    #     for line in personal_info[1:]:
    #         if '@' in line or 'github' in line or 'linkedin' in line:
    #             if 'github' in line or 'Portfolio' in line:
    #                 left_contacts.append(process_markdown_links(line))
    #             else:
    #                 right_contacts.append(process_markdown_links(line))
    #         elif '+' in line or 'phone' in line.lower() or 'mobile' in line.lower():
    #             left_contacts.append(process_markdown_links(line))
        
    #     # Create a table for the contact information
    #     if left_contacts or right_contacts:
    #         contact_table_data = [[
    #             Paragraph('<br/>'.join(left_contacts), styles['ContactInfo']),
    #             Paragraph('<br/>'.join(right_contacts), styles['ContactInfo'])
    #         ]]
            
    #         contact_table = Table(contact_table_data, colWidths=[doc.width/2.0]*2)
    #         contact_table.setStyle(TableStyle([
    #             ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    #             ('ALIGN', (0, 0), (0, -1), 'LEFT'),
    #             ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
    #         ]))
            
    #         elements.append(contact_table)
    #         elements.append(Spacer(1, 0.1*inch))
    
    # Process each section
    for section, content in sections.items():
        if not content:
            continue
            
        # Add section header
        elements.append(Paragraph(section, styles['SectionHeader']))
        
        # Process content based on section type
        if section == "Experience" or section == "Projects" or section == "Open-Source Contribution":
            current_item = None
            current_details = None
            bullet_points = []
            
            for line in content:
                if not line:
                    continue
                    
                # Check if this is a new job/project title
                if current_item is None or (not line.startswith('•') and not line.startswith('-') and not current_details):
                    # Add previous item if it exists
                    if current_item:
                        # Add bullet points
                        if bullet_points:
                            for point in bullet_points:
                                elements.append(Paragraph(f"• {process_markdown_links(point)}", styles['BulletPoint']))
                        bullet_points = []
                    
                    current_item = line
                    current_details = None
                    elements.append(Paragraph(process_markdown_links(current_item), styles['JobTitle']))
                
                # Check if this is job/project details (usually italicized)
                elif current_item and current_details is None and not line.startswith('•') and not line.startswith('-'):
                    current_details = line
                    elements.append(Paragraph(process_markdown_links(current_details), styles['JobDetails']))
                
                # This must be a bullet point
                elif line.startswith('•') or line.startswith('-'):
                    bullet_text = line[1:].strip()
                    bullet_points.append(bullet_text)
            
            # Add the last bullet points if any
            if bullet_points:
                for point in bullet_points:
                    elements.append(Paragraph(f"• {process_markdown_links(point)}", styles['BulletPoint']))
        
        elif section == "Skills":
            # Process skills as a paragraph or bullet points
            skill_text = ' • '.join([process_markdown_links(s) for s in content if s])
            elements.append(Paragraph(skill_text, styles['CustomNormal']))
        
        elif section == "Certifications":
            # Process certifications with clickable links
            for line in content:
                if line:
                    elements.append(Paragraph(process_markdown_links(line), styles['CustomNormal']))
        
        elif section == "Publications":
            # Process publications with clickable links
            for line in content:
                if line:
                    elements.append(Paragraph(process_markdown_links(line), styles['CustomNormal']))
        
        elif section == "Education":
            # Process education
            for line in content:
                if line:
                    elements.append(Paragraph(process_markdown_links(line), styles['CustomNormal']))
        
        else:
            # Default processing for other sections
            for line in content:
                if line:
                    if line.startswith('•') or line.startswith('-'):
                        elements.append(Paragraph(f"• {process_markdown_links(line[1:].strip())}", styles['BulletPoint']))
                    else:
                        elements.append(Paragraph(process_markdown_links(line), styles['CustomNormal']))
    
    # Build the PDF
    doc.build(elements)
    
    return output_filename

def process_markdown_links(text):
    """Convert Markdown links [text](url) to ReportLab hyperlinks."""
    # Regular expression to find markdown links
    pattern = r'\[(.*?)\]$$(.*?)$$'
    
    # Replace markdown links with ReportLab hyperlinks
    def replace_link(match):
        link_text = match.group(1)
        link_url = match.group(2)
        return f'<a href="{link_url}" color="blue">{link_text}</a>'
    
    return re.sub(pattern, replace_link, text)